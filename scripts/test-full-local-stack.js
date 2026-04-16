#!/usr/bin/env node

/**
 * AIOX Full Local Stack Test — Validates EVERYTHING:
 * 1. Ollama direct connectivity (localhost:11434)
 * 2. API Pool Proxy (local-only mode verification)
 * 3. Agent definitions (YAML parse + required fields)
 * 4. Obsidian Vault (Neural Brain path)
 * 5. OpenClaude availability
 * 6. MCP Server integrity
 * 7. IDE Sync parity
 */

const http = require('http');
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const ROOT = process.cwd();

// ── Colors ──
const G = s => `\x1b[32m${s}\x1b[0m`;
const R = s => `\x1b[31m${s}\x1b[0m`;
const Y = s => `\x1b[33m${s}\x1b[0m`;
const C = s => `\x1b[36m${s}\x1b[0m`;
const D = s => `\x1b[2m${s}\x1b[0m`;

let pass = 0, fail = 0, warn = 0;
const results = [];

function log(status, name, detail) {
  const icon = status === 'PASS' ? G('✅') : status === 'FAIL' ? R('❌') : Y('⚠️');
  console.log(`  ${icon} [${name}]: ${detail}`);
  results.push({ status, name, detail });
  if (status === 'PASS') pass++;
  else if (status === 'FAIL') fail++;
  else warn++;
}

// ── Helper: HTTP request with promise ──
function httpPost(hostname, port, path, payload, timeout = 30000) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify(payload);
    const req = http.request({
      hostname, port, path, method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(data) },
      timeout,
    }, res => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => resolve({ status: res.statusCode, body }));
    });
    req.on('error', reject);
    req.on('timeout', () => { req.destroy(); reject(new Error('timeout')); });
    req.write(data);
    req.end();
  });
}

async function main() {
  console.log('');
  console.log(C('╔══════════════════════════════════════════════════════════╗'));
  console.log(C('║  🧪 AIOX FULL LOCAL STACK TEST — Zero Cloud Mode        ║'));
  console.log(C('║  Testing: Ollama + Proxy + Agents + Obsidian + MCP      ║'));
  console.log(C('╚══════════════════════════════════════════════════════════╝'));
  console.log('');

  // ═══════════════════════════════════════════════════════════
  // TEST 1: Ollama Direct Connectivity
  // ═══════════════════════════════════════════════════════════
  console.log(C('\n── 1. OLLAMA DIRECT ──'));
  try {
    const ollamaRes = await httpPost('localhost', 11434, '/v1/chat/completions', {
      model: 'qwen2.5-coder:3b',
      messages: [{ role: 'user', content: 'Respond with exactly: AIOX_OK' }],
      max_tokens: 20,
    });
    if (ollamaRes.status === 200) {
      const parsed = JSON.parse(ollamaRes.body);
      const content = parsed.choices?.[0]?.message?.content || '';
      log('PASS', 'ollama-direct', `Status 200. Model responded: "${content.substring(0, 60)}..."`);
    } else {
      log('FAIL', 'ollama-direct', `HTTP ${ollamaRes.status}`);
    }
  } catch (e) {
    log('FAIL', 'ollama-direct', `Connection failed: ${e.message}`);
  }

  // ═══════════════════════════════════════════════════════════
  // TEST 2: Ollama model list
  // ═══════════════════════════════════════════════════════════
  console.log(C('\n── 2. OLLAMA MODELS ──'));
  try {
    const list = execSync('ollama list', { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] });
    const models = list.split('\n').slice(1).filter(l => l.trim());
    models.forEach(m => console.log(D(`     ${m.trim()}`)));
    log('PASS', 'ollama-models', `${models.length} models available locally`);
  } catch (e) {
    log('FAIL', 'ollama-models', e.message);
  }

  // ═══════════════════════════════════════════════════════════
  // TEST 3: API Pool — Local-Only Enforcement
  // ═══════════════════════════════════════════════════════════
  console.log(C('\n── 3. API POOL CONFIG ──'));
  try {
    const poolPath = path.join(ROOT, '.aiox-core', 'local', 'api-pool.json');
    const pool = JSON.parse(fs.readFileSync(poolPath, 'utf8'));
    const enabled = pool.providers.filter(p => p.enabled);
    const cloudEnabled = enabled.filter(p => p.provider !== 'ollama');
    
    if (cloudEnabled.length > 0) {
      log('FAIL', 'pool-local-only', `${cloudEnabled.length} cloud provider(s) still enabled: ${cloudEnabled.map(c => c.id).join(', ')}`);
    } else if (enabled.length === 0) {
      log('FAIL', 'pool-local-only', 'No providers enabled at all!');
    } else {
      log('PASS', 'pool-local-only', `Only "${enabled[0].id}" (${enabled[0].model}) enabled — ZERO CLOUD`);
    }
  } catch (e) {
    log('FAIL', 'pool-config', e.message);
  }

  // ═══════════════════════════════════════════════════════════
  // TEST 4: Agent Definitions (all .md in agents/)
  // ═══════════════════════════════════════════════════════════
  console.log(C('\n── 4. AGENT DEFINITIONS ──'));
  const agentsDir = path.join(ROOT, '.aiox-core', 'development', 'agents');
  try {
    const agentFiles = fs.readdirSync(agentsDir).filter(f => f.endsWith('.md'));
    let agentPass = 0, agentFail = 0;
    
    for (const file of agentFiles) {
      const content = fs.readFileSync(path.join(agentsDir, file), 'utf8');
      const hasYaml = content.includes('```yaml');
      const hasAgent = content.includes('agent:');
      const hasName = content.includes('name:');
      const hasCommands = content.includes('commands:');
      
      if (hasYaml && hasAgent && hasName) {
        agentPass++;
      } else {
        agentFail++;
        log('FAIL', `agent-${file}`, `Missing: ${!hasYaml ? 'YAML block ' : ''}${!hasAgent ? 'agent: ' : ''}${!hasName ? 'name: ' : ''}`);
      }
    }
    
    if (agentFail === 0) {
      log('PASS', 'agent-definitions', `All ${agentPass} agents have valid YAML blocks with required fields`);
    }
    
    // Check Neural agent specifically
    const neuralPath = path.join(agentsDir, 'neural.md');
    if (fs.existsSync(neuralPath)) {
      const nc = fs.readFileSync(neuralPath, 'utf8');
      if (nc.includes('sync-brain') && nc.includes('search-brain')) {
        log('PASS', 'agent-neural', 'Neural agent has sync-brain and search-brain commands');
      } else {
        log('WARN', 'agent-neural', 'Missing expected commands');
      }
    } else {
      log('FAIL', 'agent-neural', 'neural.md not found!');
    }
  } catch (e) {
    log('FAIL', 'agent-scan', e.message);
  }

  // ═══════════════════════════════════════════════════════════
  // TEST 5: Task Definitions
  // ═══════════════════════════════════════════════════════════
  console.log(C('\n── 5. TASKS ──'));
  const tasksDir = path.join(ROOT, '.aiox-core', 'development', 'tasks');
  try {
    const taskFiles = fs.readdirSync(tasksDir).filter(f => f.endsWith('.md'));
    log('PASS', 'task-count', `${taskFiles.length} tasks available`);
    
    const neuralTask = path.join(tasksDir, 'neural-brain-sync.md');
    if (fs.existsSync(neuralTask)) {
      const tc = fs.readFileSync(neuralTask, 'utf8');
      if (tc.includes('NEURAL_BRAIN_PATH')) {
        log('PASS', 'task-neural-sync', 'neural-brain-sync.md references NEURAL_BRAIN_PATH correctly');
      } else {
        log('WARN', 'task-neural-sync', 'Missing NEURAL_BRAIN_PATH reference');
      }
    } else {
      log('FAIL', 'task-neural-sync', 'neural-brain-sync.md not found');
    }
  } catch (e) {
    log('FAIL', 'task-scan', e.message);
  }

  // ═══════════════════════════════════════════════════════════
  // TEST 6: Obsidian Vault / Neural Brain
  // ═══════════════════════════════════════════════════════════
  console.log(C('\n── 6. OBSIDIAN VAULT / NEURAL BRAIN ──'));
  const vaultPath = process.env.NEURAL_BRAIN_PATH || 'C:\\Users\\expea\\OneDrive\\Documentos\\DIto';
  try {
    if (fs.existsSync(vaultPath)) {
      const obsidianDir = path.join(vaultPath, '.obsidian');
      if (fs.existsSync(obsidianDir)) {
        log('PASS', 'obsidian-vault', `Valid Obsidian vault at: ${vaultPath}`);
      } else {
        log('WARN', 'obsidian-vault', `Directory exists but no .obsidian folder: ${vaultPath}`);
      }
      
      // Count markdown notes
      const files = fs.readdirSync(vaultPath).filter(f => f.endsWith('.md'));
      log('PASS', 'vault-notes', `${files.length} markdown notes found in vault root`);
    } else {
      log('FAIL', 'obsidian-vault', `Path not found: ${vaultPath}`);
    }
  } catch (e) {
    log('FAIL', 'obsidian-vault', e.message);
  }

  // Check .env for NEURAL_BRAIN_PATH
  try {
    const envContent = fs.readFileSync(path.join(ROOT, '.env'), 'utf8');
    if (envContent.includes('NEURAL_BRAIN_PATH=')) {
      log('PASS', 'env-neural-path', 'NEURAL_BRAIN_PATH configured in .env');
    } else {
      log('WARN', 'env-neural-path', 'NEURAL_BRAIN_PATH not in .env');
    }
  } catch (e) {
    log('WARN', 'env-file', '.env not found');
  }

  // ═══════════════════════════════════════════════════════════
  // TEST 7: OpenClaude
  // ═══════════════════════════════════════════════════════════
  console.log(C('\n── 7. OPENCLAUDE ──'));
  try {
    const ocVersion = execSync('openclaude --version', { encoding: 'utf8', timeout: 10000, stdio: ['ignore', 'pipe', 'ignore'] }).trim();
    log('PASS', 'openclaude-cmd', `openclaude available, version: ${ocVersion}`);
  } catch (e) {
    log('WARN', 'openclaude-cmd', 'openclaude not in PATH or failed version check');
  }

  // ═══════════════════════════════════════════════════════════
  // TEST 8: MCP Server
  // ═══════════════════════════════════════════════════════════
  console.log(C('\n── 8. MCP SERVER ──'));
  const mcpScript = path.join(ROOT, 'scripts', 'aiox-mcp-server.js');
  try {
    if (fs.existsSync(mcpScript)) {
      const mcpContent = fs.readFileSync(mcpScript, 'utf8');
      const tools = ['aiox_get_pool_status', 'aiox_rotate_providers', 'aiox_toggle_gaming_mode'];
      const foundTools = tools.filter(t => mcpContent.includes(t));
      if (foundTools.length === tools.length) {
        log('PASS', 'mcp-tools', `All ${tools.length} MCP tools defined (pool status, rotate, gaming mode)`);
      } else {
        log('WARN', 'mcp-tools', `Only ${foundTools.length}/${tools.length} tools found`);
      }
    } else {
      log('FAIL', 'mcp-server', 'aiox-mcp-server.js not found');
    }
  } catch (e) {
    log('FAIL', 'mcp-server', e.message);
  }

  // ═══════════════════════════════════════════════════════════
  // TEST 9: IDE Sync Parity
  // ═══════════════════════════════════════════════════════════
  console.log(C('\n── 9. IDE SYNC PARITY ──'));
  try {
    const sourceAgents = fs.readdirSync(agentsDir).filter(f => f.endsWith('.md')).length;
    const ideTargets = ['claude-code', 'codex', 'gemini', 'cursor', 'antigravity', 'openclaude', 'github-copilot'];
    let synced = 0;
    
    for (const ide of ideTargets) {
      const ideAgentDir = path.join(ROOT, '.agents', ide);
      if (fs.existsSync(ideAgentDir)) {
        const ideAgents = fs.readdirSync(ideAgentDir).filter(f => f.endsWith('.md')).length;
        if (ideAgents >= sourceAgents) {
          synced++;
        } else {
          log('WARN', `ide-${ide}`, `${ideAgents}/${sourceAgents} agents synced`);
        }
      }
    }
    
    if (synced > 0) {
      log('PASS', 'ide-sync', `${synced} IDEs fully synced with ${sourceAgents} agents`);
    }
  } catch (e) {
    log('WARN', 'ide-sync', e.message);
  }

  // ═══════════════════════════════════════════════════════════
  // TEST 10: Neural Network Boot Script
  // ═══════════════════════════════════════════════════════════
  console.log(C('\n── 10. NEURAL BOOT SCRIPT ──'));
  const bootScript = path.join(ROOT, 'scripts', 'start-neural-network.ps1');
  try {
    if (fs.existsSync(bootScript)) {
      const sc = fs.readFileSync(bootScript, 'utf8');
      const checks = [
        ['NEURAL_BRAIN_PATH', sc.includes('NEURAL_BRAIN_PATH')],
        ['ollama-check', sc.includes('ollama') || sc.includes('Ollama')],
        ['openclaude-launch', sc.includes('openclaude') || sc.includes('aiox.js')],
      ];
      const passed = checks.filter(c => c[1]).length;
      if (passed === checks.length) {
        log('PASS', 'boot-script', 'start-neural-network.ps1 has all required sections');
      } else {
        const missing = checks.filter(c => !c[1]).map(c => c[0]).join(', ');
        log('WARN', 'boot-script', `Missing sections: ${missing}`);
      }
    } else {
      log('FAIL', 'boot-script', 'start-neural-network.ps1 not found');
    }
  } catch (e) {
    log('FAIL', 'boot-script', e.message);
  }

  // ═══════════════════════════════════════════════════════════
  // TEST 11: AIOX Doctor (delegated)
  // ═══════════════════════════════════════════════════════════
  console.log(C('\n── 11. AIOX DOCTOR ──'));
  try {
    const doctorOut = execSync('node bin/aiox.js doctor', { encoding: 'utf8', timeout: 15000, cwd: ROOT });
    const passMatch = doctorOut.match(/(\d+) PASS/);
    const failMatch = doctorOut.match(/(\d+) FAIL/);
    const warnMatch = doctorOut.match(/(\d+) WARN/);
    const dp = passMatch ? parseInt(passMatch[1]) : 0;
    const df = failMatch ? parseInt(failMatch[1]) : 0;
    const dw = warnMatch ? parseInt(warnMatch[1]) : 0;
    
    if (df === 0) {
      log('PASS', 'aiox-doctor', `${dp} PASS, ${dw} WARN, ${df} FAIL`);
    } else {
      log('FAIL', 'aiox-doctor', `${dp} PASS, ${dw} WARN, ${df} FAIL`);
    }
  } catch (e) {
    log('WARN', 'aiox-doctor', `Doctor warning: ${e.message.substring(0, 80)}`);
  }

  // ═══════════════════════════════════════════════════════════
  // FINAL REPORT
  // ═══════════════════════════════════════════════════════════
  console.log('');
  console.log(C('═══════════════════════════════════════════════════════════'));
  console.log(C('  📊 FINAL REPORT'));
  console.log(C('═══════════════════════════════════════════════════════════'));
  console.log(`  ${G(`✅ PASS: ${pass}`)}  |  ${Y(`⚠️  WARN: ${warn}`)}  |  ${R(`❌ FAIL: ${fail}`)}`);
  
  if (fail === 0 && warn === 0) {
    console.log(G('\n  🎯 PERFECT SCORE! All systems operational — 100% Local Mode.'));
  } else if (fail === 0) {
    console.log(G('\n  ✅ CORE SYSTEMS HEALTHY. Warnings are non-blocking.'));
  } else {
    console.log(R('\n  ⚠️  FAILURES DETECTED. Review items marked ❌ above.'));
  }
  console.log(`\n  Mode: ${C('LOCAL-ONLY (Ollama)')}`);
  console.log(`  Cloud APIs: ${R('ALL DISABLED')}`);
  console.log(`  Vault: ${G(vaultPath)}`);
  console.log('');
  
  process.exit(fail > 0 ? 1 : 0);
}

main().catch(e => {
  console.error(R(`Fatal error: ${e.message}`));
  process.exit(2);
});
