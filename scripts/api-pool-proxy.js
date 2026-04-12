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
  // Apply aggressive truncation for Groq (small context)
  const limit = providerObj.provider === 'groq' ? 8000 : MAX_SHIELD * 4;
  let chopped = false;
  if (data.messages && Array.isArray(data.messages)) {
    data.messages = data.messages.map(msg => {
      if (msg.content && typeof msg.content === 'string' && msg.content.length > limit) {
        msg.content = msg.content.substring(0, limit) + '\n...[TRUNCATED]...';
        chopped = true;
      }
      if (Array.isArray(msg.content)) {
        msg.content.forEach(c => {
          if (c.type === 'text' && c.text && c.text.length > limit) {
            c.text = c.text.substring(0, limit) + '\n...[TRUNCATED]...';
            chopped = true;
          }
        });
      }
      return msg;
    });
  }

  // AIOX AGGRESSIVE COMPRESSION for Tools!
  if (providerObj.provider === 'groq' && data.tools && Array.isArray(data.tools)) {
    data.tools = data.tools.map(t => {
      if (t.function && t.function.description && t.function.description.length > 200) {
        t.function.description = t.function.description.substring(0, 200) + '...';
        chopped = true;
      }
      if (t.description && t.description.length > 200) {
        t.description = t.description.substring(0, 200) + '...';
        chopped = true;
      }
      return t;
    });
  }
  return chopped;
}

// ── Forward request to actual provider ──
function forwardRequest(providerObj, reqPath, reqMethod, payload, authHeader, res, retryCount) {
  const parsed = new URL(providerObj.base_url);
  const relativePath = reqPath.startsWith('/v1') ? reqPath.substring(3) : reqPath;
  const targetPath = parsed.pathname.replace(/\/$/, '') + relativePath;

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
    // ── Any provider error >= 400? Rotate and retry next provider ──
    if (proxyRes.statusCode >= 400 && retryCount < providers.length - 1) {
      // Consume body to free socket
      proxyRes.resume();
      const next = rotate(`HTTP ${proxyRes.statusCode} (${proxyRes.statusMessage})`);

      // Re-parse & re-shield for new provider
      const newData = JSON.parse(payload);
      if (next.model) newData.model = next.model;
      applyShield(newData, next);
      const newPayload = JSON.stringify(newData);

      forwardRequest(next, reqPath, reqMethod, newPayload, authHeader, res, retryCount + 1);
      return;
    }

    if (proxyRes.statusCode >= 400 && retryCount >= providers.length - 1) {
      console.error(red('[POOL] ALL PROVIDERS EXHAUSTED OR ERRORING. Returning fake AI response.'));
      const fakeResponse = {
        id: 'chatcmpl-aiox-err',
        object: 'chat.completion',
        created: Date.now(),
        model: 'gemini/groq-pool',
        choices: [
          {
            index: 0,
            message: { role: 'assistant', content: '❌ **AIOX Pool Failure:** Todas as APIs estão sobrecarregadas (Rate Limit). Espere um minuto antes de continuar.' },
            finish_reason: 'stop',
          },
        ],
        usage: { prompt_tokens: 0, completion_tokens: 0, total_tokens: 0 },
      };
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(fakeResponse));
      return;
    }

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

// ── Forward Binary Audio (STT) ──
function forwardAudioRequest(providerObj, reqPath, reqMethod, bodyBuffer, contentType, res) {
  const parsed = new URL(providerObj.base_url);
  // Remove /v1/chat/completions suffix to get base path for audio
  const basePath = parsed.pathname.replace(/\/v1$/, '');
  const targetPath = basePath + '/v1/audio/transcriptions';

  const options = {
    hostname: parsed.hostname,
    port: parsed.port || 443,
    path: targetPath,
    method: reqMethod,
    headers: {
      'Content-Type': contentType,
      'Authorization': `Bearer ${providerObj.api_key}`,
      'Content-Length': bodyBuffer.length,
    },
  };

  const proto = parsed.protocol === 'http:' ? http : https;
  const proxyReq = proto.request(options, proxyRes => {
    res.writeHead(proxyRes.statusCode, proxyRes.headers);
    proxyRes.pipe(res);
  });

  proxyReq.on('error', err => {
    console.error(red(`[POOL-AUDIO] Erro de rede (${providerObj.id}):`), err.message);
    res.statusCode = 502;
    res.end(JSON.stringify({ error: 'Audio provider network error' }));
  });

  proxyReq.write(bodyBuffer);
  proxyReq.end();
}

const server = http.createServer((req, res) => {
  console.log(`[PROXY DEBUG] Incoming request: ${req.method} ${req.url}`);
  // GET /v1/models — return synthetic list so OpenClaude's validator is satisfied.
  // We match startsWith because OpenClaude queries /v1/models/gpt-4o specifically.
  if (req.url.startsWith('/v1/models') && req.method === 'GET') {
    const isSingleModel = req.url.length > '/v1/models'.length;
    
    // If it's querying a specific model (e.g. /v1/models/gpt-4o), return just that model object
    if (isSingleModel) {
      const requestedId = req.url.split('/').pop() || 'gpt-4o';
      const syntheticModel = {
        id: requestedId,
        object: 'model',
        created: Date.now(),
        owned_by: 'aiox-pool',
      };
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(syntheticModel));
      console.log(dim(`[POOL] ${req.url} → synthetic model object served`));
      return;
    }
    const syntheticModels = {
      object: 'list',
      data: [
        // Include all models the pool knows about + the placeholder OpenClaude expects
        { id: 'gpt-4o', object: 'model', created: Date.now(), owned_by: 'aiox-pool' },
        ...providers.map(p => ({
          id: p.model,
          object: 'model',
          created: Date.now(),
          owned_by: `aiox-pool:${p.provider}`,
        })),
      ],
    };
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(syntheticModels));
    console.log(dim(`[POOL] /v1/models → synthetic list served (${syntheticModels.data.length} models)`));
    return;
  }

  // POST handling
  if (req.method === 'POST') {
    if (req.url.includes('/v1/audio/transcriptions')) {
      // ── STT (Speech-to-Text): /v1/audio/transcriptions ──
      const body = [];
      req.on('data', chunk => body.push(chunk));
      req.on('end', () => {
        const bodyBuffer = Buffer.concat(body);
        console.log(cyan(`[POOL-AUDIO] Recebido payload de áudio (${bodyBuffer.length} bytes)`));
        
        // Encontrar stt-provider ou usar o padrão se houver (Whisper local etc)
        const p = providers.find(prov => prov.provider === 'whisper' || prov.id.includes('whisper')) || current();
        
        forwardAudioRequest(p, req.url, 'POST', bodyBuffer, req.headers['content-type'], res);
      });
      return;
    }

    // General JSON POST (completions, etc)
    const body = [];
    req.on('data', chunk => body.push(chunk));
    req.on('end', () => {
      try {
        const raw = Buffer.concat(body).toString();
        const data = JSON.parse(raw);
        console.log(dim(`[PROXY] Payload size: ${raw.length} chars. Messages: ${data.messages?.length || 0}`));
        
        let p = current();

        // ── AIOX ESTRATÉGIA HÍBRIDA (Smart Demand Routing) ──
        if (raw.length > 128000 && p.provider === 'ollama') {
          const cloudP = providers.find(prov => prov.provider !== 'ollama' && prov.provider !== 'groq' && prov.enabled);
          if (cloudP) {
            console.log(cyan(`\n⚡ [HYBRID ROUTER] Demanda massiva detectada (${Math.round(raw.length/1024)} KB)!`));
            console.log(cyan(`⚡ Bypass Local-First: Direcionando para Nuvem Gratuita (${cloudP.id}) provisoriamente para evitar lentidão.\n`));
            p = cloudP;
          }
        }

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

  } else {
    // Catch-all for any unhandled routes to prevent indefinite connection hanging
    console.log(red(`[POOL] Route not found: ${req.method} ${req.url}`));
    res.statusCode = 404;
    res.end(JSON.stringify({ error: { message: 'Route not found in AIOX proxy.' } }));
  }
});

const PORT = process.env.AIOX_POOL_PORT || 3100;
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
