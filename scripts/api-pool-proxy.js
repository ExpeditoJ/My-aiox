/**
 * AIOX API Pool Proxy — Smart reverse-proxy with automatic key rotation.
 * When a provider returns 429 / quota-exceeded, the proxy hot-swaps to the
 * next enabled provider in the pool and retries transparently.
 *
 * Usage: node scripts/api-pool-proxy.js          (reads .aiox-core/local/api-pool.json)
 *   or:  fork()'d from bin/aiox.js automatically
 */

const http = require('http');
const https = require('https');
const fs = require('fs');
const path = require('path');
const url = require('url');

// ── Colors ──
const cyan   = s => `\x1b[1;36m${s}\x1b[0m`;
const green  = s => `\x1b[32m${s}\x1b[0m`;
const yellow = s => `\x1b[33m${s}\x1b[0m`;
const red    = s => `\x1b[31m${s}\x1b[0m`;
const dim    = s => `\x1b[2m${s}\x1b[0m`;

// ── Load pool config ──
const poolPath = path.join(process.cwd(), '.aiox-core', 'local', 'api-pool.json');
let pool;
try {
  pool = JSON.parse(fs.readFileSync(poolPath, 'utf8'));
} catch (e) {
  console.error(red('[POOL] Falha ao ler api-pool.json:'), e.message);
  process.exit(1);
}

const providers = pool.providers
  .filter(p => p.enabled)
  .sort((a, b) => a.priority - b.priority);

if (providers.length === 0) {
  console.error(red('[POOL] Nenhum provider habilitado no pool!'));
  process.exit(1);
}

let currentIdx = 0;
let rotationCount = 0;
const MAX_SHIELD = pool.shield?.max_string_length || 12000;
const SHIELD_ON  = pool.shield?.enabled !== false;

function current() { return providers[currentIdx]; }

function rotate(reason) {
  const prev = current();
  currentIdx = (currentIdx + 1) % providers.length;
  rotationCount++;
  const next = current();
  console.log(yellow(`[POOL] 🔄 Rotação #${rotationCount}: ${prev.id} → ${next.id} (${reason})`));
  return next;
}

// ── Shield: truncate large payloads (Groq protection) ──
function applyShield(data, providerObj) {
  if (!SHIELD_ON) return false;
  // Only apply aggressive truncation for Groq (small context)
  const limit = providerObj.provider === 'groq' ? MAX_SHIELD : MAX_SHIELD * 4;
  let chopped = false;
  if (data.messages && Array.isArray(data.messages)) {
    data.messages = data.messages.map(msg => {
      if (msg.content && typeof msg.content === 'string' && msg.content.length > limit) {
        console.log(dim(`[SHIELD] Truncando ${msg.role}: ${msg.content.length} → ${limit}`));
        msg.content = msg.content.substring(0, limit) + '\n...[TRUNCATED BY AIOX POOL]...';
        chopped = true;
      }
      if (Array.isArray(msg.content)) {
        msg.content.forEach(c => {
          if (c.type === 'text' && c.text && c.text.length > limit) {
            c.text = c.text.substring(0, limit) + '\n...[TRUNCATED BY AIOX POOL]...';
            chopped = true;
          }
        });
      }
      return msg;
    });
  }
  return chopped;
}

// ── Forward request to actual provider ──
function forwardRequest(providerObj, reqPath, reqMethod, payload, authHeader, res, retryCount) {
  const parsed = new URL(providerObj.base_url);
  const targetPath = parsed.pathname.replace(/\/$/, '') + reqPath;

  const options = {
    hostname: parsed.hostname,
    port: parsed.port || 443,
    path: targetPath,
    method: reqMethod,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${providerObj.api_key}`,
      'Content-Length': Buffer.byteLength(payload),
    },
  };

  const proto = parsed.protocol === 'http:' ? http : https;
  const proxyReq = proto.request(options, proxyRes => {
    // ── Quota exceeded? Rotate and retry ──
    if ((proxyRes.statusCode === 429 || proxyRes.statusCode === 503) && retryCount < providers.length) {
      // Consume body to free socket
      proxyRes.resume();
      const next = rotate(`HTTP ${proxyRes.statusCode}`);

      // Re-parse & re-shield for new provider
      const newData = JSON.parse(payload);
      if (next.model) newData.model = next.model;
      applyShield(newData, next);
      const newPayload = JSON.stringify(newData);

      forwardRequest(next, reqPath, reqMethod, newPayload, authHeader, res, retryCount + 1);
      return;
    }

    // ── Success or non-retryable error: pipe through ──
    res.writeHead(proxyRes.statusCode, proxyRes.headers);
    proxyRes.pipe(res);
  });

  proxyReq.on('error', err => {
    console.error(red(`[POOL] Erro de rede (${providerObj.id}):`), err.message);
    if (retryCount < providers.length) {
      const next = rotate('network error');
      forwardRequest(next, reqPath, reqMethod, payload, authHeader, res, retryCount + 1);
    } else {
      res.statusCode = 502;
      res.end(JSON.stringify({ error: 'All providers exhausted' }));
    }
  });

  proxyReq.write(payload);
  proxyReq.end();
}

// ── HTTP Server ──
const server = http.createServer((req, res) => {
  // GET /v1/models — aggregate from active provider
  if (req.url === '/v1/models' && req.method === 'GET') {
    const p = current();
    const parsed = new URL(p.base_url);
    const targetPath = parsed.pathname.replace(/\/$/, '') + '/models';
    const proto = parsed.protocol === 'http:' ? http : https;
    const headers = { 'Authorization': `Bearer ${p.api_key}` };
    const proxyReq = proto.request({ hostname: parsed.hostname, path: targetPath, method: 'GET', headers }, proxyRes => {
      res.writeHead(proxyRes.statusCode, proxyRes.headers);
      proxyRes.pipe(res);
    });
    proxyReq.on('error', () => { res.statusCode = 500; res.end(); });
    proxyReq.end();
    return;
  }

  // POST /v1/chat/completions (and others)
  if (req.method === 'POST') {
    let body = [];
    req.on('data', chunk => body.push(chunk));
    req.on('end', () => {
      try {
        const raw = Buffer.concat(body).toString();
        const data = JSON.parse(raw);
        const p = current();

        // Override model with pool's configured model
        if (p.model) data.model = p.model;

        // Apply shield
        applyShield(data, p);

        const payload = JSON.stringify(data);
        forwardRequest(p, req.url, 'POST', payload, req.headers['authorization'], res, 0);
      } catch (e) {
        console.error(red('[POOL] Parse error:'), e.message);
        res.statusCode = 400;
        res.end(JSON.stringify({ error: 'Invalid JSON' }));
      }
    });
  } else if (req.method !== 'GET') {
    res.statusCode = 405;
    res.end();
  }
});

const PORT = process.env.AIOX_POOL_PORT || 3000;
server.listen(PORT, () => {
  console.log('');
  console.log(cyan('╔══════════════════════════════════════════════════╗'));
  console.log(cyan('║   🔄 AIOX API POOL PROXY — Multi-Provider v1    ║'));
  console.log(cyan('╚══════════════════════════════════════════════════╝'));
  console.log(green(`   Porta: ${PORT}`));
  console.log('   Providers no pool:');
  providers.forEach((p, i) => {
    const marker = i === currentIdx ? ' ➜ ' : '   ';
    console.log(`${marker}${green(`[${p.priority}]`)} ${p.id} (${p.provider}) — ${dim(p.model)}`);
  });
  console.log(dim(`   Shield: ${SHIELD_ON ? 'ON' : 'OFF'} (max ${MAX_SHIELD} chars)`));
  console.log('');
});
