#!/usr/bin/env node

/**
 * AIOX Hub MCP Server v1.1 — Unified Local-First Orchestration
 * ===========================================================
 * MCP Server personalizado para o sistema do Arquiteto.
 * Adicionado: Muscle Tools (Web Search & Discord Notify).
 * 
 * Capabilities:
 *   1. ollama_status       — Motor local status
 *   2. ollama_chat         — Chat direto com Gemma 3:4b
 *   3. api_pool_status     — Pool drivers status
 *   4. api_pool_switch     — Troca de drivers em tempo real
 *   5. obsidian_write      — Exportação para Obsidian
 *   6. obsidian_read       — Leitura do Obsidian
 *   7. system_info         — Hardware profile (GTX 1650)
 *   8. web_search          — Busca na Web (DuckDuckGo)
 *   9. discord_notify      — Alertas para Discord (Webhook)
 *  10. store_memory        — Memória inter-sessão
 *  11. read_memory         — Histórico de memórias
 *  12. search_memory       — Busca na memória neural
 */

const fs = require('fs');
const path = require('path');
const http = require('http');
const https = require('https');
const { execSync, spawn } = require('child_process');
const { search } = require('duck-duck-scrape');
const { Server } = require('@modelcontextprotocol/sdk/server/index.js');
const { StdioServerTransport } = require('@modelcontextprotocol/sdk/server/stdio.js');
const {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  ErrorCode,
  McpError,
} = require('@modelcontextprotocol/sdk/types.js');

// ── Paths ──────────────────────────────────────────────
const ROOT = path.resolve(__dirname, '..', '..', '..');
const LOCAL_DIR = path.join(ROOT, '.aiox-core', 'local');
const API_POOL_FILE = path.join(LOCAL_DIR, 'api-pool.json');
const MEMORY_FILE = path.join(LOCAL_DIR, 'global-memory.json');
const OBSIDIAN_VAULT = path.join('C:', 'Users', 'expea', 'OneDrive', 'Documentos', 'My Games');

if (!fs.existsSync(LOCAL_DIR)) fs.mkdirSync(LOCAL_DIR, { recursive: true });
if (!fs.existsSync(MEMORY_FILE)) {
  fs.writeFileSync(MEMORY_FILE, JSON.stringify({ entries: [] }, null, 2), 'utf8');
}

// ── Helpers ────────────────────────────────────────────
function loadJSON(filepath) {
  try { return JSON.parse(fs.readFileSync(filepath, 'utf8')); }
  catch { return null; }
}
function saveJSON(filepath, data) {
  fs.writeFileSync(filepath, JSON.stringify(data, null, 2), 'utf8');
}
function httpRequest(url, options = {}, body = null) {
  return new Promise((resolve, reject) => {
    const { hostname, port, pathname, protocol } = new URL(url);
    const mod = protocol === 'https:' ? https : http;
    const req = mod.request({
      hostname, port, path: pathname,
      method: options.method || 'GET',
      headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
      timeout: 30000,
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try { resolve({ status: res.statusCode, data: JSON.parse(data) }); }
        catch { resolve({ status: res.statusCode, data }); }
      });
    });
    req.on('error', reject);
    req.on('timeout', () => { req.destroy(); reject(new Error('Request timeout')); });
    if (body) req.write(JSON.stringify(body));
    req.end();
  });
}

// ── Server Setup ───────────────────────────────────────
const server = new Server(
  { name: 'aiox-hub', version: '1.1.0' },
  { capabilities: { tools: {} } },
);

server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: [
    { name: 'ollama_status', description: 'Verifica Ollama + modelos.', inputSchema: { type: 'object', properties: {} } },
    { name: 'ollama_chat', description: 'Prompt direto pro Gemma local.', inputSchema: { type: 'object', properties: { prompt: { type: 'string' } }, required: ['prompt'] } },
    { name: 'api_pool_status', description: 'Status do pool de APIs.', inputSchema: { type: 'object', properties: {} } },
    { name: 'api_pool_switch', description: 'Habilita/Desabilita driver no pool.', inputSchema: { type: 'object', properties: { provider_id: { type: 'string' }, enabled: { type: 'boolean' } }, required: ['provider_id', 'enabled'] } },
    { name: 'obsidian_write', description: 'Escreve no Obsidian.', inputSchema: { type: 'object', properties: { filename: { type: 'string' }, content: { type: 'string' }, subfolder: { type: 'string' } }, required: ['filename', 'content'] } },
    { name: 'obsidian_read', description: 'Lê do Obsidian.', inputSchema: { type: 'object', properties: { filename: { type: 'string' }, subfolder: { type: 'string' } }, required: ['filename'] } },
    { name: 'system_info', description: 'Hardware profile (GTX 1650).', inputSchema: { type: 'object', properties: {} } },
    { name: 'web_search', description: 'Busca na web (DuckDuckGo).', inputSchema: { type: 'object', properties: { query: { type: 'string' } }, required: ['query'] } },
    { name: 'discord_notify', description: 'Notifica no Discord via Webhook.', inputSchema: { type: 'object', properties: { message: { type: 'string' } }, required: ['message'] } },
    { name: 'store_memory', description: 'Salva memória inter-sessão.', inputSchema: { type: 'object', properties: { title: { type: 'string' }, content: { type: 'string' }, tags: { type: 'array', items: { type: 'string' } } }, required: ['title', 'content'] } },
    { name: 'read_memory', description: 'Recupera memórias recentes.', inputSchema: { type: 'object', properties: { limit: { type: 'number' } } } },
    { name: 'search_memory', description: 'Busca na memória neural por query.', inputSchema: { type: 'object', properties: { query: { type: 'string' } }, required: ['query'] } },
    { name: 'spawn_muscle', description: 'Lança uma tarefa do OpenClaude em background (Músculo). Operação assíncrona que não bloqueia o cérebro.', inputSchema: { type: 'object', properties: { instruction: { type: 'string', description: 'O comando ou prompt para o músculo' }, agent: { type: 'string', description: 'ID do agente (ex: dev, qa)' } }, required: ['instruction'] } },
    { name: 'list_active_muscles', description: 'Lista processos de músculos ativos em background.', inputSchema: { type: 'object', properties: {} } },
  ],
}));

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  if (name === 'ollama_status') {
    try {
      const res = await httpRequest('http://127.0.0.1:11434/api/tags');
      const models = res.data?.models || [];
      const list = models.map(m => `• ${m.name}`).join('\n');
      return { content: [{ type: 'text', text: `✅ Ollama ONLINE\n📦 Modelos:\n${list || '(vazio)'}` }] };
    } catch { return { content: [{ type: 'text', text: '❌ Ollama OFFLINE' }] }; }
  }

  if (name === 'ollama_chat') {
    const model = args.model || 'gemma3:4b';
    try {
      const res = await httpRequest('http://127.0.0.1:11434/api/chat', { method: 'POST' }, {
        model, messages: [{ role: 'user', content: args.prompt }], stream: false,
      });
      return { content: [{ type: 'text', text: res.data?.message?.content || 'Erro na resposta' }] };
    } catch (e) { return { content: [{ type: 'text', text: `❌ Erro Ollama: ${e.message}` }] }; }
  }

  if (name === 'api_pool_status') {
    const pool = loadJSON(API_POOL_FILE);
    if (!pool) return { content: [{ type: 'text', text: '❌ Sem pool config' }] };
    const lines = pool.providers.map(p => `${p.enabled ? '🟢' : '⚫'} [${p.priority}] ${p.id} (${p.model})`);
    return { content: [{ type: 'text', text: `📊 Pool Drivers:\n${lines.join('\n')}` }] };
  }

  if (name === 'api_pool_switch') {
    const pool = loadJSON(API_POOL_FILE);
    const provider = pool?.providers.find(p => p.id === args.provider_id);
    if (!provider) return { content: [{ type: 'text', text: `❌ Provedor ${args.provider_id} não encontrado` }] };
    provider.enabled = args.enabled;
    saveJSON(API_POOL_FILE, pool);
    return { content: [{ type: 'text', text: `✅ ${provider.id} -> ${args.enabled ? 'ATIVO' : 'OFF'}` }] };
  }

  if (name === 'obsidian_write') {
    const dir = args.subfolder ? path.join(OBSIDIAN_VAULT, args.subfolder) : OBSIDIAN_VAULT;
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(path.join(dir, args.filename), args.content, 'utf8');
    return { content: [{ type: 'text', text: `📝 Salvo em ${args.filename}` }] };
  }

  if (name === 'obsidian_read') {
    const pth = path.join(args.subfolder ? path.join(OBSIDIAN_VAULT, args.subfolder) : OBSIDIAN_VAULT, args.filename);
    if (!fs.existsSync(pth)) return { content: [{ type: 'text', text: '❌ Arquivo não encontrado' }] };
    return { content: [{ type: 'text', text: fs.readFileSync(pth, 'utf8') }] };
  }

  if (name === 'system_info') {
    let info = '🖥️ AIOX System Profile:\n';
    try {
      const gpu = execSync('wmic path win32_videocontroller get name /value', { encoding: 'utf8' }).split('\n').filter(l => l.includes('Name=')).map(l => l.split('=')[1]?.trim()).join(', ');
      info += `• GPU: ${gpu || 'Desconhecida'}\n• Awareness: GTX 1650 (4GB) detected\n`;
    } catch { info += '• GPU: Error collecting\n'; }
    return { content: [{ type: 'text', text: info }] };
  }

  if (name === 'web_search') {
    try {
      const results = await search(args.query, { safeSearch: 1 });
      const snippet = results.results.slice(0, 5).map(r => `🔗 ${r.title}\n   ${r.url}`).join('\n\n');
      return { content: [{ type: 'text', text: `🌐 Resultados para "${args.query}":\n\n${snippet}` }] };
    } catch (e) { return { content: [{ type: 'text', text: `❌ Erro na busca: ${e.message}` }] }; }
  }

  if (name === 'discord_notify') {
    const webhook = process.env.DISCORD_WEBHOOK_URL;
    if (!webhook) return { content: [{ type: 'text', text: '⚠️ [AIOX] DISCORD_WEBHOOK_URL missing' }] };
    try {
      await httpRequest(webhook, { method: 'POST' }, { content: `🔴 **AIOX Alert**: ${args.message}` });
      return { content: [{ type: 'text', text: '🚀 Notificação enviada' }] };
    } catch (e) { return { content: [{ type: 'text', text: `❌ Discord Error: ${e.message}` }] }; }
  }

  if (name === 'store_memory') {
    const db = loadJSON(MEMORY_FILE) || { entries: [] };
    const entry = { id: Date.now().toString(), timestamp: new Date().toISOString(), title: args.title, content: args.content, tags: args.tags || [] };
    db.entries.push(entry);
    saveJSON(MEMORY_FILE, db);
    return { content: [{ type: 'text', text: `💾 Memória salva: ${entry.title}` }] };
  }

  if (name === 'read_memory') {
    const db = loadJSON(MEMORY_FILE) || { entries: [] };
    const sorted = [...db.entries].sort((a,b) => Number(b.id) - Number(a.id)).slice(0, args.limit || 10);
    return { content: [{ type: 'text', text: JSON.stringify(sorted, null, 2) }] };
  }

  if (name === 'search_memory') {
    const db = loadJSON(MEMORY_FILE) || { entries: [] };
    const q = args.query.toLowerCase();
    const results = db.entries.filter(e => e.title.toLowerCase().includes(q) || e.content.toLowerCase().includes(q) || (e.tags && e.tags.some(t => t.toLowerCase().includes(q))));
    return { content: [{ type: 'text', text: JSON.stringify(results, null, 2) }] };
  }

  // ─── 11. SPAWN MUSCLE ──────────────────────────────
  if (name === 'spawn_muscle') {
    const instruction = args.instruction;
    const agentId = args.agent || 'main';
    const sessionId = `aiox-${Date.now()}`;
    const logFile = path.join(LOCAL_DIR, `muscle-${Date.now()}.log`);
    
    try {
      // Adicionado --session-id para evitar erro de escolha de sessão no Gateway
      const muscle = spawn('openclaw', ['agent', '--message', instruction, '--agent', agentId, '--thinking', 'low', '--session-id', sessionId], {
        detached: true,
        stdio: 'ignore',
      });
      muscle.unref();
      
      const msg = `🚀 Zarabatana Neural disparada.\n📥 Instrução: "${instruction}"\n👤 Agente: ${agentId}\n🆔 Sessão: ${sessionId}\n📃 Músculo em processamento no background...`;
      return { content: [{ type: 'text', text: msg }] };
    } catch (e) {
      return { content: [{ type: 'text', text: `❌ Falha ao spawnar músculo: ${e.message}` }], isError: true };
    }
  }

  // ─── 12. LIST ACTIVE MUSCLES ────────────────────────
  if (name === 'list_active_muscles') {
    try {
      const output = execSync('tasklist /FI "IMAGENAME eq node.exe" /FO CSV /NH', { encoding: 'utf8' });
      return { content: [{ type: 'text', text: `👀 Processos de Músculo ativos (Inspecione detalhes via logs):\n\n${output}` }] };
    } catch (e) {
      return { content: [{ type: 'text', text: 'Não foi possível listar processos em background.' }] };
    }
  }

  throw new McpError(ErrorCode.MethodNotFound, `Tool not found: ${name}`);
});

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  process.stderr.write('🚀 AIOX Hub MCP v1.1.0 Ready\n');
}

main().catch((error) => {
  process.stderr.write(`Fatal: ${error}\n`);
  process.exit(1);
});
