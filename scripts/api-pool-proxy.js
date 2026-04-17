#!/usr/bin/env node
/**
 * AIOX API Pool Proxy v3.0 (Definitive)
 * 
 * Reverse proxy that sits between OpenClaude and Ollama/Cloud providers.
 * Features:
 *   - Provider rotation with priority-based fallback
 *   - AIOX Brain Wash: Force-injects execution directives
 *   - Tool Strip: Removes tools[] from payload for models that don't support it
 *   - Payload Shield: Truncates oversized strings
 *   - Hot Reload: Watches api-pool.json for live config changes
 */

const http = require('http');
const fs = require('fs');
const path = require('path');

const poolPath = path.join(__dirname, '..', '.aiox-core', 'local', 'api-pool.json');

// ── ANSI Colors ──
const green  = s => `\x1b[32m${s}\x1b[0m`;
const cyan   = s => `\x1b[36m${s}\x1b[0m`;
const red    = s => `\x1b[31m${s}\x1b[0m`;
const dim    = s => `\x1b[2m${s}\x1b[0m`;
const yellow = s => `\x1b[33m${s}\x1b[0m`;

// ── Pool State ──
let providers = [];
let pool = {};
let currentIdx = 0;
let rotationCount = 0;

function loadPool() {
  try {
    const data = fs.readFileSync(poolPath, 'utf8');
    pool = JSON.parse(data);
    providers = pool.providers
      .filter(p => p.enabled)
      .sort((a, b) => a.priority - b.priority);

    if (providers.length === 0) {
      console.error(red('[POOL] Nenhum provider habilitado no pool!'));
    } else {
      console.log(green(`[POOL] Configuração carregada (${providers.length} ativos)`));
      currentIdx = 0;
    }
  } catch (e) {
    console.error(red('[POOL] Falha ao carregar pool:'), e.message);
  }
}

loadPool();

// ── Hot Reloading ──
let reloadDebounce = null;
fs.watch(poolPath, (eventType) => {
  if (eventType === 'change') {
    if (reloadDebounce) clearTimeout(reloadDebounce);
    reloadDebounce = setTimeout(() => {
      console.log(cyan('[POOL] Mudança detectada no api-pool.json. Recarregando...'));
      loadPool();
    }, 500);
  }
});

const MAX_SHIELD = pool.shield?.max_string_length || 12000;
const SHIELD_ON  = pool.shield?.enabled !== false;

// ── Provider Rotation ──
function current() {
  if (providers.length === 0) return null;
  return providers[currentIdx % providers.length];
}

function rotate(reason) {
  rotationCount++;
  currentIdx = (currentIdx + 1) % providers.length;
  const next = current();
  if (next) {
    console.log(yellow(`[POOL] Rotação #${rotationCount}: ${reason} → Novo: ${next.id}`));
  }
  return next;
}

// ── Payload Shield ──
function shieldPayload(obj) {
  if (!SHIELD_ON) return obj;
  if (typeof obj === 'string') {
    return obj.length > MAX_SHIELD ? obj.slice(0, MAX_SHIELD) + '...[TRUNCATED]' : obj;
  }
  if (Array.isArray(obj)) return obj.map(shieldPayload);
  if (obj && typeof obj === 'object') {
    const out = {};
    for (const [k, v] of Object.entries(obj)) {
      out[k] = shieldPayload(v);
    }
    return out;
  }
  return obj;
}

// ── AIOX Brain Wash ──
const BRAIN_WASH = [
  'CRITICAL INSTRUCTION:',
  '1. DO NOT describe, list, or summarize tools/functions.',
  '2. JUST EXECUTE the user request using available tools OR answer directly.',
  '3. Respond ALWAYS in Português do Brasil (PT-BR).',
  '4. Be extremely direct and technical.',
  '5. If user says hello/hi, respond "AIOX ONLINE" and wait for orders.',
].join(' ');

function injectBrainWash(data) {
  if (!data.messages || !Array.isArray(data.messages)) return;

  const systemMsg = data.messages.find(m => m.role === 'system');
  if (systemMsg) {
    systemMsg.content += `\n\n[AIOX DIRECTIVE]: ${BRAIN_WASH}`;
  } else {
    data.messages.unshift({ role: 'system', content: BRAIN_WASH });
  }
}

// ── Tool Strip (for models without native tool support) ──
function shouldStripTools(provider) {
  // Models known to NOT support tools natively via Ollama
  const noToolModels = ['gemma3', 'gemma:'];
  const model = (provider?.model || '').toLowerCase();
  return noToolModels.some(m => model.includes(m));
}

function stripTools(data) {
  if (data.tools) {
    console.log(dim(`[SHIELD] Stripping ${data.tools.length} tools from payload (model doesn't support native tools)`));
    delete data.tools;
    delete data.tool_choice;
  }
}

// ── Proxy Request Handler ──
function proxyRequest(data, provider, res) {
  const url = new URL(provider.base_url);
  const payload = JSON.stringify(data);

  const options = {
    hostname: url.hostname,
    port: url.port || (url.protocol === 'https:' ? 443 : 80),
    path: `${url.pathname.replace(/\/+$/, '')}/chat/completions`,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(payload),
      'Authorization': `Bearer ${provider.api_key}`,
    },
    timeout: 120000,
  };

  // Use https for cloud providers
  const transport = url.protocol === 'https:' ? require('https') : http;

  const proxyReq = transport.request(options, (proxyRes) => {
    let body = '';
    proxyRes.on('data', chunk => body += chunk);
    proxyRes.on('end', () => {
      if (proxyRes.statusCode >= 400) {
        console.log(red(`[PROXY] ${provider.id} respondeu ${proxyRes.statusCode}: ${body.slice(0, 200)}`));

        // Try rotation on failure
        if (proxyRes.statusCode === 429 || proxyRes.statusCode >= 500) {
          const next = rotate(`HTTP ${proxyRes.statusCode}`);
          if (next && next.id !== provider.id) {
            console.log(cyan(`[POOL] Tentando fallback: ${next.id}`));
            // Adjust model for new provider
            data.model = next.model;
            if (shouldStripTools(next)) stripTools(data);
            return proxyRequest(data, next, res);
          }
        }
      }

      res.writeHead(proxyRes.statusCode, {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      });
      res.end(body);
    });
  });

  proxyReq.on('error', (err) => {
    console.log(red(`[PROXY] Erro de conexão com ${provider.id}: ${err.message}`));
    const next = rotate(`Connection error: ${err.message}`);
    if (next && next.id !== provider.id) {
      data.model = next.model;
      if (shouldStripTools(next)) stripTools(data);
      return proxyRequest(data, next, res);
    }

    res.writeHead(502, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      error: {
        message: `AIOX Pool Failure: Todas as APIs estão indisponíveis. Último erro: ${err.message}`,
        type: 'proxy_error',
      },
    }));
  });

  proxyReq.on('timeout', () => {
    proxyReq.destroy();
    console.log(red(`[PROXY] Timeout com ${provider.id}`));
    const next = rotate('Timeout');
    if (next && next.id !== provider.id) {
      data.model = next.model;
      if (shouldStripTools(next)) stripTools(data);
      return proxyRequest(data, next, res);
    }

    res.writeHead(504, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      error: { message: 'AIOX Pool Failure: Timeout em todos os providers.', type: 'proxy_error' },
    }));
  });

  proxyReq.write(payload);
  proxyReq.end();
}

// ── HTTP Server ──
const PORT = process.env.AIOX_POOL_PORT || 3100;

const server = http.createServer((req, res) => {
  // CORS preflight
  if (req.method === 'OPTIONS') {
    res.writeHead(200, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    });
    return res.end();
  }

  // Health check
  if (req.method === 'GET' && (req.url === '/health' || req.url === '/v1/models')) {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    return res.end(JSON.stringify({
      status: 'ok',
      activeProviders: providers.map(p => p.id),
      currentProvider: current()?.id,
      rotationCount,
    }));
  }

  // Chat completions
  if (req.method === 'POST' && req.url?.includes('/chat/completions')) {
    const body = [];
    req.on('data', chunk => body.push(chunk));
    req.on('end', () => {
      try {
        const raw = Buffer.concat(body).toString();
        const data = JSON.parse(raw);

        // Brain Wash injection
        injectBrainWash(data);

        // Shield payload
        const shielded = shieldPayload(data);

        let p = current();
        if (!p) {
          res.writeHead(503, { 'Content-Type': 'application/json' });
          return res.end(JSON.stringify({
            error: { message: 'AIOX Pool: Nenhum provider disponível.', type: 'proxy_error' },
          }));
        }

        // Override model with provider's configured model
        shielded.model = p.model;

        // Strip tools for incompatible models
        if (shouldStripTools(p)) {
          stripTools(shielded);
        }

        console.log(dim(`[PROXY] ${p.id} ← ${shielded.messages?.length || 0} msgs, model: ${shielded.model}, tools: ${shielded.tools?.length || 0}`));

        proxyRequest(shielded, p, res);
      } catch (e) {
        console.log(red(`[PROXY] Parse error: ${e.message}`));
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: { message: e.message, type: 'parse_error' } }));
      }
    });
    return;
  }

  // Fallback
  res.writeHead(404, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ error: { message: 'Not found', type: 'not_found' } }));
});

server.listen(PORT, () => {
  console.log(green(`\n🛡️  AIOX Pool Proxy v3.0 (Definitive)`));
  console.log(green(`   Porta: ${PORT}`));
  console.log(green(`   Providers: ${providers.map(p => p.id).join(', ')}`));
  console.log(green(`   Brain Wash: ON`));
  console.log(green(`   Shield: ${SHIELD_ON ? 'ON' : 'OFF'} (max: ${MAX_SHIELD} chars)`));
  console.log(green(`   Hot Reload: ON\n`));
});

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.log(yellow(`[POOL] Porta ${PORT} já em uso. Proxy provavelmente já está rodando.`));
    process.exit(0);
  }
  console.error(red('[POOL] Erro fatal:'), err.message);
  process.exit(1);
});
