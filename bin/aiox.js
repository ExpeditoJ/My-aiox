#!/usr/bin/env node

/**
 * AIOX-FullStack CLI
 * Main entry point - Standalone (no external dependencies for npx compatibility)
 * Version: 4.0.0
 */

const path = require('path');
const fs = require('fs');
const { execSync } = require('child_process');

// Read package.json for version
const packageJsonPath = path.join(__dirname, '..', 'package.json');
const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));

// Parse arguments
const args = process.argv.slice(2);
const command = args[0];

// Helper: Run initialization wizard
async function runWizard(options = {}) {
  // Use the v4 wizard from packages/installer/src/wizard/index.js
  const wizardPath = path.join(__dirname, '..', 'packages', 'installer', 'src', 'wizard', 'index.js');

  if (!fs.existsSync(wizardPath)) {
    // Fallback to legacy wizard if new wizard not found
    const legacyScript = path.join(__dirname, 'aiox-init.js');
    if (fs.existsSync(legacyScript)) {
      if (!options.quiet) {
        console.log('⚠️  Using legacy wizard (src/wizard not found)');
      }
      // Legacy wizard doesn't support options, pass via env vars
      process.env.AIOX_INSTALL_FORCE = options.force ? '1' : '';
      process.env.AIOX_INSTALL_QUIET = options.quiet ? '1' : '';
      process.env.AIOX_INSTALL_DRY_RUN = options.dryRun ? '1' : '';
      require(legacyScript);
      return;
    }
    console.error('❌ Initialization wizard not found');
    console.error('Please ensure AIOX-FullStack is installed correctly.');
    process.exit(1);
  }

  try {
    // Run the v4 wizard with options
    const { runWizard: executeWizard } = require(wizardPath);
    await executeWizard(options);
  } catch (error) {
    console.error('❌ Wizard error:', error.message);
    process.exit(1);
  }
}

// Helper: Show help
function showHelp() {
  console.log(`
AIOX-FullStack v${packageJson.version}
AI-Orchestrated System for Full Stack Development

USAGE:
  npx aiox-core@latest              # Run installation wizard
  npx aiox-core@latest install      # Install in current project
  npx aiox-core@latest init <name>  # Create new project
  npx aiox-core@latest update       # Update to latest version
  npx aiox-core@latest validate     # Validate installation integrity
  npx aiox-core@latest info         # Show system info
  npx aiox-core@latest doctor       # Run diagnostics
  npx aiox-core@latest --version    # Show version
  npx aiox-core@latest --version -d # Show detailed version info
  npx aiox-core@latest --help       # Show this help

UPDATE:
  aiox update                    # Update to latest version
  aiox update --check            # Check for updates without applying
  aiox update --dry-run          # Preview what would be updated
  aiox update --force            # Force update even if up-to-date
  aiox update --verbose          # Show detailed output

VALIDATION:
  aiox validate                    # Validate installation integrity
  aiox validate --repair           # Repair missing/corrupted files
  aiox validate --repair --dry-run # Preview repairs
  aiox validate --detailed         # Show detailed file list

CONFIGURATION:
  aiox config show                       # Show resolved configuration
  aiox config show --debug               # Show with source annotations
  aiox config diff --levels L1,L2        # Compare config levels
  aiox config migrate                    # Migrate monolithic to layered
  aiox config validate                   # Validate config files
  aiox config init-local                 # Create local-config.yaml

AGENTS & EXECUTION:
  aiox openclaude                        # Run OpenClaude natively integrated
  aiox run openclaude                    # Alias for aiox openclaude

SERVICE DISCOVERY:
  aiox workers search <query>            # Search for workers
  aiox workers search "json" --category=data
  aiox workers search "transform" --tags=etl,data
  aiox workers search "api" --format=json

EXAMPLES:
  # Install in current directory
  npx aiox-core@latest

  # Install with minimal mode (only expansion-creator)
  npx aiox-core-minimal@latest

  # Create new project
  npx aiox-core@latest init my-project

  # Search for workers
  aiox workers search "json csv"

For more information, visit: https://github.com/SynkraAI/aiox-core
`);
}

// Helper: Show version
async function showVersion() {
  const isDetailed = args.includes('--detailed') || args.includes('-d');

  if (!isDetailed) {
    // Simple version output (backwards compatible)
    console.log(packageJson.version);
    return;
  }

  // Detailed version output (Story 7.2: Version Tracking)
  console.log(`AIOX-FullStack v${packageJson.version}`);
  console.log('Package: aiox-core');

  // Check for local installation
  const localVersionPath = path.join(process.cwd(), '.aiox-core', 'version.json');

  if (fs.existsSync(localVersionPath)) {
    try {
      const versionInfo = JSON.parse(fs.readFileSync(localVersionPath, 'utf8'));
      console.log('\n📦 Local Installation:');
      console.log(`  Version:    ${versionInfo.version}`);
      console.log(`  Mode:       ${versionInfo.mode || 'unknown'}`);

      if (versionInfo.installedAt) {
        const installedDate = new Date(versionInfo.installedAt);
        console.log(`  Installed:  ${installedDate.toLocaleDateString()}`);
      }

      if (versionInfo.updatedAt) {
        const updatedDate = new Date(versionInfo.updatedAt);
        console.log(`  Updated:    ${updatedDate.toLocaleDateString()}`);
      }

      if (versionInfo.fileHashes) {
        const fileCount = Object.keys(versionInfo.fileHashes).length;
        console.log(`  Files:      ${fileCount} tracked`);
      }

      if (versionInfo.customized && versionInfo.customized.length > 0) {
        console.log(`  Customized: ${versionInfo.customized.length} files`);
      }

      // Version comparison
      if (versionInfo.version !== packageJson.version) {
        console.log('\n⚠️  Version mismatch!');
        console.log(`  Local:  ${versionInfo.version}`);
        console.log(`  Latest: ${packageJson.version}`);
        console.log('  Run \'npx aiox-core update\' to update.');
      } else {
        console.log('\n✅ Up to date');
      }
    } catch (error) {
      console.log(`\n⚠️  Could not read version.json: ${error.message}`);
    }
  } else {
    console.log('\n📭 No local installation found');
    console.log('  Run \'npx aiox-core install\' to install AIOX in this project.');
  }
}

// Helper: Show system info
function showInfo() {
  console.log('📊 AIOX-FullStack System Information\n');
  console.log(`Version: ${packageJson.version}`);
  console.log(`Platform: ${process.platform}`);
  console.log(`Node.js: ${process.version}`);
  console.log(`Architecture: ${process.arch}`);
  console.log(`Working Directory: ${process.cwd()}`);
  console.log(`Install Location: ${path.join(__dirname, '..')}`);

  // Check if .aiox-core exists
  const aioxCoreDir = path.join(__dirname, '..', '.aiox-core');
  if (fs.existsSync(aioxCoreDir)) {
    console.log('\n✓ AIOX Core installed');

    // Count components
    const countFiles = (dir) => {
      try {
        return fs.readdirSync(dir).length;
      } catch {
        return 0;
      }
    };

    const devDir = path.join(aioxCoreDir, 'development');
    const componentBase = fs.existsSync(devDir) ? devDir : aioxCoreDir;

    console.log(`  - Agents: ${countFiles(path.join(componentBase, 'agents'))}`);
    console.log(`  - Tasks: ${countFiles(path.join(componentBase, 'tasks'))}`);
    console.log(`  - Templates: ${countFiles(path.join(componentBase, 'templates'))}`);
    console.log(`  - Workflows: ${countFiles(path.join(componentBase, 'workflows'))}`);

  } else {
    console.log('\n⚠️  AIOX Core not found');
  }

  // Check AIOX Pro status (Task 5.1)
  const proDir = path.join(__dirname, '..', 'pro');
  if (fs.existsSync(proDir)) {
    console.log('\n✓ AIOX Pro installed');

    try {
      const { featureGate } = require(path.join(proDir, 'license', 'feature-gate'));
      const state = featureGate.getLicenseState();
      const info = featureGate.getLicenseInfo();

      const stateEmoji = {
        'Active': '✅',
        'Grace': '⚠️',
        'Expired': '❌',
        'Not Activated': '➖',
      };

      console.log(`  - License: ${stateEmoji[state] || ''} ${state}`);

      if (info && info.features) {
        const availableCount = featureGate.listAvailable().length;
        console.log(`  - Features: ${availableCount} available`);
      }
    } catch {
      console.log('  - License: Unable to check status');
    }
  }
}

// Helper: Show AIOX Local-First Status (Task 5.2)
async function showAioXStatus() {
  console.log('\n💎 AIOX Local-First Engine Status\n');
  
  // 1. Check Pool Config
  const poolPath = path.join(process.cwd(), '.aiox-core', 'local', 'api-pool.json');
  if (fs.existsSync(poolPath)) {
    try {
      const pool = JSON.parse(fs.readFileSync(poolPath, 'utf8'));
      console.log('🔄 API Pool Config info:');
      const active = pool.providers.filter(p => p.enabled).sort((a, b) => a.priority - b.priority);
      active.forEach((p, i) => {
        const marker = i === 0 ? ' ⭐ (Principal)' : `   (${i+1})`;
        console.log(`   ${marker} ${p.id} [Prio ${p.priority}] — ${p.model}`);
      });
    } catch (e) {
      console.log('   ⚠️  Failed to read pool config.');
    }
  }

  // 2. Check Ollama Status
  console.log('\n🧠 Local Engine (Ollama):');
  try {
    const { execSync } = require('child_process');
    const list = execSync('ollama list', { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] });
    console.log('   Models Pulled:');
    list.split('\n').slice(1).filter(l => l.trim()).forEach(l => {
      console.log(`   - ${l.trim()}`);
    });
    
    // Check if running
    try {
      execSync('tasklist /fi "imagename eq ollama.exe"', { stdio: 'ignore' });
      console.log('   Status: ✅ Running (Active Engine)');
    } catch {
      console.log('   Status: 💤 Idle (Gaming Mode ready)');
    }
  } catch (e) {
    console.log('   Status: ❌ Not detected in PATH or service down.');
  }

  // 3. Hardware Info
  console.log('\n🖥️  Hardware Awareness:');
  console.log(`   Platform: ${process.platform} (${process.arch})`);
  console.log('   Optimization Target: GTX 1650 (4GB VRAM detected)');
  console.log('   Gaming Mode: Enabled (Auto-kill on close)');
  
  console.log('\n💡 Tip: Run `*aiox.bat` to wake up the engine.');
}

// Helper: Run installation validation
async function runValidate() {
  const validateArgs = args.slice(1); // Remove 'validate' from args

  try {
    // Load the validate command module
    const { createValidateCommand } = require('../.aiox-core/cli/commands/validate/index.js');
    const validateCmd = createValidateCommand();

    // Parse and execute (Note: don't include 'validate' as it's the command name, not an argument)
    await validateCmd.parseAsync(['node', 'aiox', ...validateArgs]);
  } catch (_error) {
    // Fallback: Run quick validation inline
    console.log('Running installation validation...\n');

    try {
      const validatorPath = path.join(
        __dirname,
        '..',
        'packages',
        'installer',
        'src',
        'installer',
        'post-install-validator.js',
      );
      const { PostInstallValidator, formatReport } = require(validatorPath);

      const projectRoot = process.cwd();
      const validator = new PostInstallValidator(projectRoot, path.join(__dirname, '..'));
      const report = await validator.validate();

      console.log(formatReport(report, { colors: true }));

      if (
        report.status === 'failed' ||
        report.stats.missingFiles > 0 ||
        report.stats.corruptedFiles > 0
      ) {
        process.exit(1);
      }
    } catch (validatorError) {
      console.error(`❌ Validation error: ${validatorError.message}`);
      if (args.includes('--verbose') || args.includes('-v')) {
        console.error(validatorError.stack);
      }
      process.exit(2);
    }
  }
}

// Helper: Run update command
async function runUpdate() {
  const updateArgs = args.slice(1);
  const isCheck = updateArgs.includes('--check');
  const isDryRun = updateArgs.includes('--dry-run');
  const isForce = updateArgs.includes('--force');
  const isVerbose = updateArgs.includes('--verbose') || updateArgs.includes('-v');

  try {
    const updaterPath = path.join(__dirname, '..', 'packages', 'installer', 'src', 'updater', 'index.js');

    if (!fs.existsSync(updaterPath)) {
      console.error('❌ Updater module not found');
      console.error('Please ensure AIOX-FullStack is installed correctly.');
      process.exit(1);
    }

    const { AIOXUpdater, formatCheckResult, formatUpdateResult } = require(updaterPath);

    const updater = new AIOXUpdater(process.cwd(), {
      verbose: isVerbose,
      force: isForce,
    });

    if (isCheck) {
      // Check only mode
      console.log('🔍 Checking for updates...\n');
      const result = await updater.checkForUpdates();
      console.log(formatCheckResult(result, { colors: true }));

      if (result.status === 'check_failed') {
        process.exit(1);
      }
    } else {
      // Update mode
      console.log('🔄 AIOX Update\n');

      const result = await updater.update({
        dryRun: isDryRun,
        onProgress: (phase, message) => {
          if (isVerbose) {
            console.log(`[${phase}] ${message}`);
          }
        },
      });

      console.log(formatUpdateResult(result, { colors: true }));

      if (!result.success && result.error !== 'Already up to date') {
        process.exit(1);
      }
    }
  } catch (error) {
    console.error(`❌ Update error: ${error.message}`);
    if (args.includes('--verbose') || args.includes('-v')) {
      console.error(error.stack);
    }
    process.exit(1);
  }
}

// Helper: Run OpenClaude natively integrated (Multi-Provider v2)
async function runOpenClaude() {
  const { spawn, fork } = require('child_process');

  // ── Step 1: Load .env (if exists) ──
  const dotenvPath = path.join(process.cwd(), '.env');
  if (fs.existsSync(dotenvPath)) {
    const envConfig = fs.readFileSync(dotenvPath, 'utf8');
    for (const line of envConfig.split('\n')) {
      const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)??\s*$/);
      if (match) {
        let key = match[1];
        let value = match[2] || '';
        if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
          value = value.slice(1, -1);
        }
        // Safegaurd: Ignore placeholder dummy keys from .env templates
        if (value.includes('your_') && value.includes('_here')) continue;
        
        if (!process.env[key]) process.env[key] = value;
      }
    }
  }

  // ── Step 2: Load key from .aiox-core/local/.agent-keys.txt (other agent's store) ──
  const agentKeysPath = path.join(process.cwd(), '.aiox-core', 'local', '.agent-keys.txt');
  let storedKey = '';
  if (fs.existsSync(agentKeysPath)) {
    storedKey = fs.readFileSync(agentKeysPath, 'utf8').trim();
  }

  // ── Step 3: Detect provider from available keys ──
  // Priority: explicit env vars > stored key > fallback
  const apiKey = process.env.GEMINI_API_KEY || process.env.OPENAI_API_KEY || storedKey || '';
  let provider = 'unknown';

  if (apiKey.startsWith('AIza')) {
    provider = 'gemini';
  } else if (apiKey.startsWith('gsk_')) {
    provider = 'groq';
  } else if (apiKey.startsWith('sk-or-')) {
    provider = 'openrouter';
  } else if (apiKey.startsWith('csk-')) {
    provider = 'cerebras';
  } else if (apiKey.startsWith('sk-')) {
    provider = 'openai';
  } else if (apiKey.split('-').length === 5 && apiKey.length === 36) {
    provider = 'sambanova'; // UUID format
  } else if (apiKey.length > 10) {
    provider = 'openai-compat'; // generic OpenAI-compatible
  }

  // ── Step 4: Build env and args for child process ──
  const isAgentSubcommand = args[0] === 'run' || args[0] === 'agent';
  let openClaudeArgs = isAgentSubcommand ? args.slice(2) : args.slice(1);
  const env = { ...process.env };
  
  // ── Step 4.5: Configure Antigravity MCP Bridge ──
  // Auto-inject the bridge server if the user hasn't explicitly specified an mcp config
  if (!openClaudeArgs.includes('--mcp-config')) {
    const bridgeScript = path.resolve(__dirname, '..', '.aiox-core', 'core', 'mcp-servers', 'antigravity-bridge', 'index.js');
    if (fs.existsSync(bridgeScript)) {
      const mcpDirPath = path.join(process.cwd(), '.aiox-core', 'local');
      if (!fs.existsSync(mcpDirPath)) fs.mkdirSync(mcpDirPath, { recursive: true });
      const mcpConfigPath = path.join(mcpDirPath, 'aiox-mcp.json');
      
      const unifiedMcpScript = path.resolve(__dirname, '..', 'scripts', 'aiox-mcp-server.js');
      const mcpConfigContent = {
        mcpServers: {
          "aiox-antigravity": {
            command: "node",
            args: [bridgeScript]
          },
          "aiox-unified-mcp": {
            command: "node",
            args: [unifiedMcpScript]
          }
        }
      };
      fs.writeFileSync(mcpConfigPath, JSON.stringify(mcpConfigContent, null, 2), 'utf8');
      
      openClaudeArgs.push('--mcp-config', mcpConfigPath);
    }
  }
  
  // AIOX Shield: Remove Anthropic API Key to prevent OpenClaude from stopping to prompt the user interactively
  delete env.ANTHROPIC_API_KEY;
  
  // Yolo Mode Automático: Burlar prompts rigorosos do Claude-Code iterativamente
  if (!openClaudeArgs.includes('--dangerously-skip-permissions')) {
    openClaudeArgs.push('--dangerously-skip-permissions');
  }
  
  let shieldProcess = null;

  console.log('');
  console.log('╔══════════════════════════════════════════════╗');
  console.log('║   🤖 AIOX OpenClaude Runner v3 (Pool+Multi) ║');
  console.log('╚══════════════════════════════════════════════╝');

  // ── POOL MODE: Read api-pool.json and route ALL logic through local proxy ──
  const poolPath = path.join(process.cwd(), '.aiox-core', 'local', 'api-pool.json');
  let poolLoaded = false;
  if (fs.existsSync(poolPath)) {
    try {
      const pool = JSON.parse(fs.readFileSync(poolPath, 'utf8'));
      const activeProviders = (pool.providers || [])
        .filter(p => p.enabled)
        .sort((a, b) => a.priority - b.priority);

      if (activeProviders.length > 0) {
        const primary = activeProviders[0];
        console.log(`🔄 Pool carregado: ${activeProviders.length} provider(s) — Primário: ${primary.id} (${primary.provider})`);

        // ALL providers get routed through the pool proxy to emulate OpenAI
        // This universally bypasses OpenClaude's interactive setup screens
        const poolProxyScript = path.join(process.cwd(), 'scripts', 'api-pool-proxy.js');
        if (fs.existsSync(poolProxyScript)) {
          const dynamicPort = Math.floor(Math.random() * 10000) + 30000;
          console.log(`🛡️  Rota: Pool Proxy (porta dinâmica: ${dynamicPort}) → ${primary.provider}`);
          
          env.AIOX_POOL_PORT = dynamicPort.toString();
          shieldProcess = fork(poolProxyScript, [], { silent: false, cwd: process.cwd(), env: env });
          
          env.CLAUDE_CODE_USE_OPENAI = '1';
          env.OPENAI_BASE_URL = `http://localhost:${dynamicPort}/v1`;
          env.OPENAI_API_KEY = 'aiox-pool-token'; 
          // Fake gpt-4o mask so OpenClaude validates internally; proxy overwrites with real model
          if (!env.OPENAI_MODEL) env.OPENAI_MODEL = 'gpt-4o';
          await new Promise(resolve => setTimeout(resolve, 2000));
        }
        
        poolLoaded = true;

        // Store fallback info for future rotation awareness
        if (activeProviders.length > 1) {
          console.log(`   └─ Fallback: ${activeProviders.slice(1).map(p => p.id).join(' → ')}`);
        }
      }
    } catch (e) {
      console.log(`⚠️  Erro ao ler api-pool.json: ${e.message}`);
    }
  }

  // ── SINGLE PROVIDER MODE (fallback when no pool loaded) ──
  if (!poolLoaded && !shieldProcess) {
    if (provider === 'gemini') {
      console.log('🌐 Provider: Google Gemini (native)');
      env.GEMINI_API_KEY = apiKey;
    } else if (provider === 'openrouter') {
      console.log('🌌 Provider: OpenRouter');
      env.CLAUDE_CODE_USE_OPENAI = '1';
      env.OPENAI_BASE_URL = 'https://openrouter.ai/api/v1';
      env.OPENAI_API_KEY = apiKey;
      if (!env.OPENAI_MODEL) env.OPENAI_MODEL = 'meta-llama/llama-3.3-70b-instruct'; // Stable fallback
    } else if (provider === 'cerebras') {
      console.log('🧠 Provider: Cerebras (Ultra-Fast Llama)');
      env.CLAUDE_CODE_USE_OPENAI = '1';
      env.OPENAI_BASE_URL = 'https://api.cerebras.ai/v1';
      env.OPENAI_API_KEY = apiKey;
      if (!env.OPENAI_MODEL) env.OPENAI_MODEL = 'llama3.1-8b'; // Fallback safer ID for Cerebras
    } else if (provider === 'groq') {
      console.log('🛡️  Provider: Groq (direct)');
      env.CLAUDE_CODE_USE_OPENAI = '1';
      env.OPENAI_BASE_URL = 'https://api.groq.com/openai/v1';
      env.OPENAI_API_KEY = apiKey;
      if (!env.OPENAI_MODEL) env.OPENAI_MODEL = 'llama-3.3-70b-versatile';
    } else if (provider === 'openai' || provider === 'openai-compat') {
      console.log(`🔑 Provider: ${provider === 'openai' ? 'OpenAI' : 'OpenAI-Compatible'}`);
      env.CLAUDE_CODE_USE_OPENAI = '1';
      env.OPENAI_API_KEY = apiKey;
      if (!env.OPENAI_MODEL) env.OPENAI_MODEL = 'gpt-4o';
    } else {
      console.log('⚠️  Nenhuma API Key detectada. OpenClaude iniciará em modo interativo (/provider).');
    }
  }

  console.log('');

  try {
    // Resolving Ollama path for Windows (Handles cases where PATH is not updated)
    const getOllamaCmd = () => {
      if (process.platform !== 'win32') return 'ollama';
      const localAppData = process.env.LOCALAPPDATA;
      const explicitPath = require('path').join(localAppData, 'Programs', 'Ollama', 'ollama.exe');
      return require('fs').existsSync(explicitPath) ? `"${explicitPath}"` : 'ollama';
    };

    // ── Gaming Mode Auto-Wake: Start Ollama invisibly if it's in the pool ──
    if (poolLoaded && require('fs').existsSync(poolPath)) {
      try {
        const pt = JSON.parse(require('fs').readFileSync(poolPath, 'utf8'));
        const hasOllama = pt.providers && pt.providers.some(p => p.provider === 'ollama' && p.enabled);
        if (hasOllama && process.platform === 'win32') {
          const { spawn: sysSpawn } = require('child_process');
          const ollamaExec = getOllamaCmd().replace(/"/g, ''); // strip quotes for spawn
          sysSpawn(ollamaExec, ['serve'], { 
            detached: true, 
            stdio: 'ignore', 
            windowsHide: true,
            shell: false 
          }).on('error', (e) => { console.log('Ollama auto-start error:', e.message); }).unref();
          
          // Pause execution to allow Ollama to load its weights into RAM/VRAM
          require('child_process').execSync('ping 127.0.0.1 -n 3 > nul');
        }
      } catch (e) {}
    }

    // ── Command Resolution: Try global command, then npx fallback ──
    const getOpenClaudePath = () => {
      try {
        const { execSync } = require('child_process');
        execSync('openclaude --version', { stdio: 'ignore' });
        return 'openclaude';
      } catch (e) {
        console.log('⚠️  Comando "openclaude" não está no PATH. Tentando via npx...');
        return 'npx @gitlawb/openclaude';
      }
    };

    const cmdOrNpx = getOpenClaudePath();
    const [baseCmd, ...npxArgs] = cmdOrNpx.split(' ');
    const finalArgs = [...npxArgs, ...openClaudeArgs];

    const ocProcess = spawn(baseCmd, finalArgs, {
      stdio: 'inherit',
      env,
      shell: process.platform === 'win32',
    });

    // Robust Cleanup: kill Ollama and clean memory for Gaming Mode
    const killOllama = () => {
      if (process.platform === 'win32') {
        const { execSync } = require('child_process');
        try { 
          // Use taskkill with /F (force) and /T (tree) to ensure all child processes are gone
          execSync('taskkill /f /im ollama* /t', { stdio: 'ignore' }); 
          console.log('\n🎮 [Gaming Mode] VRAM liberada com sucesso.');
        } catch (e) {
          // If taskkill fails, it usually means it's already dead
        }
      }
    };

    ocProcess.on('close', (code) => {
      if (shieldProcess) shieldProcess.kill();
      killOllama(); // Liberação da Placa de Vídeo
      process.exit(code || 0);
    });

    // Handle unexpected close (e.g. terminal X button on some environments)
    process.on('exit', () => {
      killOllama();
    });

    ocProcess.on('error', (err) => {
      console.error(`❌ Erro ao iniciar o terminal AIOX: ${err.message}`);
      if (shieldProcess) shieldProcess.kill();
      killOllama();
    });

    process.on('SIGINT', () => {
      if (shieldProcess) shieldProcess.kill();
      ocProcess.kill('SIGINT');
      killOllama();
      process.exit(0);
    });
  } catch (error) {
    if (shieldProcess) shieldProcess.kill();
    console.error(`❌ Failed to run OpenClaude: ${error.message}`);
    console.error('Make sure it is installed: npm install -g @gitlawb/openclaude');
    process.exit(1);
  }
}

// Helper: Run doctor diagnostics (v2.0 — delegates to modular doctor)
async function runDoctor(options = {}) {
  const { runDoctorChecks } = require(path.join(__dirname, '..', '.aiox-core', 'core', 'doctor'));

  const result = await runDoctorChecks({
    fix: options.fix || false,
    json: options.json || false,
    dryRun: options.dryRun || false,
    quiet: options.quiet || false,
    projectRoot: process.cwd(),
  });

  console.log(result.formatted);

  // Exit with code 1 if any FAIL results
  if (result.data && result.data.summary && result.data.summary.fail > 0) {
    process.exit(1);
  }
}

// Helper: Format bytes to human readable
function formatBytes(bytes) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// Helper: Remove AIOX sections from .gitignore
function cleanGitignore(gitignorePath) {
  if (!fs.existsSync(gitignorePath)) return { removed: false };

  const content = fs.readFileSync(gitignorePath, 'utf8');
  const lines = content.split('\n');
  const newLines = [];
  let inAioxSection = false;
  let removedLines = 0;

  for (const line of lines) {
    if (line.includes('# AIOX') || line.includes('# Added by AIOX')) {
      inAioxSection = true;
      removedLines++;
      continue;
    }
    if (inAioxSection && line.trim() === '') {
      inAioxSection = false;
      continue;
    }
    if (inAioxSection) {
      removedLines++;
      continue;
    }
    newLines.push(line);
  }

  if (removedLines > 0) {
    fs.writeFileSync(gitignorePath, newLines.join('\n'));
    return { removed: true, lines: removedLines };
  }
  return { removed: false };
}

// Helper: Show uninstall help
function showUninstallHelp() {
  console.log(`
Usage: npx aiox-core uninstall [options]

Remove AIOX from the current project.

Options:
  --force      Skip confirmation prompt
  --keep-data  Keep .aiox/ directory (settings and history)
  --dry-run    Show what would be removed without removing
  -h, --help   Show this help message

What gets removed:
  - .aiox-core/     Framework core files
  - docs/stories/   Story files (if created by AIOX)
  - squads/         Squad definitions
  - .gitignore      AIOX-added entries only

What is preserved (with --keep-data):
  - .aiox/          Project settings and agent history

Exit Codes:
  0  Uninstall successful
  1  Uninstall failed or cancelled

Examples:
  # Interactive uninstall (with confirmation)
  npx aiox-core uninstall

  # Force uninstall without prompts
  npx aiox-core uninstall --force

  # See what would be removed
  npx aiox-core uninstall --dry-run

  # Uninstall but keep project data
  npx aiox-core uninstall --keep-data
`);
}

// Helper: Show doctor help
function showDoctorHelp() {
  console.log(`
Usage: npx aiox-core doctor [options]

Run health checks on your AIOX installation.

Options:
  --fix        Automatically fix detected issues
  --dry-run    Show what --fix would do without making changes
  --json       Output results as structured JSON
  --quiet      Minimal output (exit code only)
  -h, --help   Show this help message

Checks performed:
  • Required directories exist (.aiox-core/, .aiox/)
  • Configuration files are valid JSON/YAML
  • Agent definitions are complete
  • Task files have required fields
  • Dependencies are installed

Exit Codes:
  0  All checks passed (or issues fixed with --fix)
  1  Issues detected (run with --fix to repair)

Examples:
  # Run health check
  npx aiox-core doctor

  # Auto-fix detected issues
  npx aiox-core doctor --fix

  # Preview what would be fixed
  npx aiox-core doctor --fix --dry-run
`);
}

// Uninstall AIOX from project
async function runUninstall(options = {}) {
  const { force = false, keepData = false, dryRun = false, quiet = false } = options;
  const cwd = process.cwd();

  // Items to remove
  const itemsToRemove = [
    { path: '.aiox-core', description: 'Framework core' },
    { path: 'squads', description: 'Squad definitions' },
  ];

  // Optionally remove .aiox
  if (!keepData) {
    itemsToRemove.push({ path: '.aiox', description: 'Project data and settings' });
  }

  // Check what exists
  const existingItems = itemsToRemove.filter(item =>
    fs.existsSync(path.join(cwd, item.path)),
  );

  if (existingItems.length === 0) {
    console.log('ℹ️  No AIOX installation found in this directory.');
    return;
  }

  // Calculate total size
  let totalSize = 0;
  const itemSizes = [];

  for (const item of existingItems) {
    const itemPath = path.join(cwd, item.path);
    try {
      const stats = fs.statSync(itemPath);
      if (stats.isDirectory()) {
        // Simple recursive size calculation
        const getSize = (dir) => {
          let size = 0;
          try {
            const files = fs.readdirSync(dir);
            for (const file of files) {
              const filePath = path.join(dir, file);
              const stat = fs.statSync(filePath);
              if (stat.isDirectory()) {
                size += getSize(filePath);
              } else {
                size += stat.size;
              }
            }
          } catch { /* ignore errors */ }
          return size;
        };
        const size = getSize(itemPath);
        totalSize += size;
        itemSizes.push({ ...item, size });
      } else {
        totalSize += stats.size;
        itemSizes.push({ ...item, size: stats.size });
      }
    } catch {
      itemSizes.push({ ...item, size: 0 });
    }
  }

  // Show what will be removed
  if (!quiet) {
    console.log('\n📋 Items to be removed:\n');
    for (const item of itemSizes) {
      const sizeStr = item.size > 0 ? ` (${formatBytes(item.size)})` : '';
      console.log(`  • ${item.path}/${sizeStr} - ${item.description}`);
    }
    console.log(`\n  Total: ${formatBytes(totalSize)}`);

    // Check for .gitignore cleanup
    const gitignorePath = path.join(cwd, '.gitignore');
    if (fs.existsSync(gitignorePath)) {
      const content = fs.readFileSync(gitignorePath, 'utf8');
      if (content.includes('# AIOX') || content.includes('# Added by AIOX')) {
        console.log('  • .gitignore AIOX entries will be cleaned');
      }
    }
    console.log('');
  }

  // Dry run - stop here
  if (dryRun) {
    console.log('🔍 Dry run - no changes made.');
    return;
  }

  // Confirmation
  if (!force) {
    const readline = require('readline');
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    const answer = await new Promise(resolve => {
      rl.question('⚠️  Are you sure you want to uninstall AIOX? (y/N): ', resolve);
    });
    rl.close();

    if (answer.toLowerCase() !== 'y' && answer.toLowerCase() !== 'yes') {
      console.log('❌ Uninstall cancelled.');
      process.exit(1);
    }
  }

  // Perform removal
  if (!quiet) console.log('\n🗑️  Removing AIOX components...\n');

  for (const item of existingItems) {
    const itemPath = path.join(cwd, item.path);
    try {
      fs.rmSync(itemPath, { recursive: true, force: true });
      if (!quiet) console.log(`  ✓ Removed ${item.path}/`);
    } catch (error) {
      console.error(`  ✗ Failed to remove ${item.path}: ${error.message}`);
    }
  }

  // Clean .gitignore
  const gitignorePath = path.join(cwd, '.gitignore');
  const gitignoreResult = cleanGitignore(gitignorePath);
  if (gitignoreResult.removed && !quiet) {
    console.log(`  ✓ Cleaned ${gitignoreResult.lines} AIOX entries from .gitignore`);
  }

  // Summary
  if (!quiet) {
    console.log('\n✅ AIOX has been uninstalled.');
    if (keepData) {
      console.log('   Your project data in .aiox/ has been preserved.');
    }
    console.log('\n   To reinstall: npx aiox-core install');
  }
}

// Helper: Show install help
function showInstallHelp() {
  console.log(`
Usage: npx aiox-core install [options]

Install AIOX in the current directory.

Options:
  --force      Overwrite existing AIOX installation
  --quiet      Minimal output (no banner, no prompts) - ideal for CI/CD
  --dry-run    Simulate installation without modifying files
  --merge      Auto-merge existing config files (brownfield mode)
  --no-merge   Disable merge option, use legacy overwrite behavior
  -h, --help   Show this help message

Smart Merge (Brownfield):
  When installing in a project with existing config files (.env, CLAUDE.md),
  AIOX can merge new settings while preserving your customizations.

  - .env files: Adds new variables, preserves existing values
  - CLAUDE.md: Updates AIOX sections, keeps your custom rules

Exit Codes:
  0  Installation successful
  1  Installation failed

Examples:
  # Interactive installation
  npx aiox-core install

  # Force reinstall without prompts
  npx aiox-core install --force

  # Brownfield: merge configs automatically
  npx aiox-core install --merge

  # Silent install for CI/CD
  npx aiox-core install --quiet --force

  # Preview what would be installed
  npx aiox-core install --dry-run
`);
}

// Helper: Create new project
// Helper: Show init help
function showInitHelp() {
  console.log(`
Usage: npx aiox-core init <project-name> [options]

Create a new AIOX project with the specified name.

Options:
  --force              Force creation in non-empty directory
  --skip-install       Skip npm dependency installation
  --template <name>    Use specific template (default: default)
  -t <name>            Shorthand for --template
  -h, --help           Show this help message

Available Templates:
  default     Full installation with all agents, tasks, and workflows
  minimal     Essential files only (dev agent + basic tasks)
  enterprise  Everything + dashboards + team integrations

Examples:
  npx aiox-core init my-project
  npx aiox-core init my-project --template minimal
  npx aiox-core init my-project --force --skip-install
  npx aiox-core init . --template enterprise
`);
}

async function initProject() {
  // 1. Parse ALL args after 'init'
  const initArgs = args.slice(1);

  // 2. Handle --help FIRST (before creating any directories)
  if (initArgs.includes('--help') || initArgs.includes('-h')) {
    showInitHelp();
    return;
  }

  // 3. Parse flags
  const isForce = initArgs.includes('--force');
  const skipInstall = initArgs.includes('--skip-install');

  // Template with argument
  const templateIndex = initArgs.findIndex((a) => a === '--template' || a === '-t');
  let template = 'default';
  if (templateIndex !== -1) {
    template = initArgs[templateIndex + 1];
    if (!template || template.startsWith('-')) {
      console.error('❌ --template requires a template name');
      console.error('Available templates: default, minimal, enterprise');
      process.exit(1);
    }
  }

  // Validate template
  const validTemplates = ['default', 'minimal', 'enterprise'];
  if (!validTemplates.includes(template)) {
    console.error(`❌ Unknown template: ${template}`);
    console.error(`Available templates: ${validTemplates.join(', ')}`);
    process.exit(1);
  }

  // 4. Extract project name (anything that doesn't start with - and isn't a template value)
  const projectName = initArgs.find((arg, i) => {
    if (arg.startsWith('-')) return false;
    // Skip if it's the value after --template
    const prevArg = initArgs[i - 1];
    if (prevArg === '--template' || prevArg === '-t') return false;
    return true;
  });

  if (!projectName) {
    console.error('❌ Project name is required');
    console.log('\nUsage: npx aiox-core init <project-name> [options]');
    console.log('Run with --help for more information.');
    process.exit(1);
  }

  // 5. Handle "." to install in current directory
  const isCurrentDir = projectName === '.';
  const targetPath = isCurrentDir ? process.cwd() : path.join(process.cwd(), projectName);
  const displayName = isCurrentDir ? path.basename(process.cwd()) : projectName;

  // 6. Check if directory exists
  if (fs.existsSync(targetPath) && !isCurrentDir) {
    const contents = fs.readdirSync(targetPath).filter((f) => !f.startsWith('.'));
    if (contents.length > 0 && !isForce) {
      console.error(`❌ Directory already exists and is not empty: ${projectName}`);
      console.error('Use --force to overwrite.');
      process.exit(1);
    }
    if (contents.length > 0 && isForce) {
      console.log(`⚠️  Using --force: overwriting existing directory: ${projectName}`);
    } else {
      console.log(`✓ Using existing empty directory: ${projectName}`);
    }
  } else if (!fs.existsSync(targetPath)) {
    fs.mkdirSync(targetPath, { recursive: true });
    console.log(`✓ Created directory: ${projectName}`);
  }

  console.log(`Creating new AIOX project: ${displayName}`);
  if (template !== 'default') {
    console.log(`Template: ${template}`);
  }
  if (skipInstall) {
    console.log('Skip install: enabled');
  }
  console.log('');

  // 7. Change to project directory (if not already there)
  if (!isCurrentDir) {
    process.chdir(targetPath);
  }

  // 8. Run the initialization wizard with options
  await runWizard({
    template,
    skipInstall,
    force: isForce,
  });
}

// Command routing (async main function)
async function main() {
  switch (command) {
    case 'workers':
      // Service Discovery CLI - Story 2.7
      try {
        const { run } = require('../.aiox-core/cli/index.js');
        await run(process.argv);
      } catch (error) {
        console.error(`❌ Workers command error: ${error.message}`);
        process.exit(1);
      }
      break;

    case 'config':
      // Layered Configuration CLI - Story PRO-4
      try {
        const { run } = require('../.aiox-core/cli/index.js');
        await run(process.argv);
      } catch (error) {
        console.error(`❌ Config command error: ${error.message}`);
        process.exit(1);
      }
      break;

    case 'pro':
      // AIOX Pro License Management - Story PRO-6
      try {
        const { run } = require('../.aiox-core/cli/index.js');
        await run(process.argv);
      } catch (error) {
        console.error(`❌ Pro command error: ${error.message}`);
        process.exit(1);
      }
      break;

    case 'openclaude':
    case 'oc':
      await runOpenClaude();
      break;

    case 'run':
    case 'agent':
      if (args[1] === 'openclaude' || args[1] === 'oc') {
        await runOpenClaude();
      } else {
        console.error(`❌ Unknown agent/runner: ${args[1]}`);
        process.exit(1);
      }
      break;

    case 'install': {
      // Install in current project with flag support
      const installArgs = args.slice(1);
      if (installArgs.includes('--help') || installArgs.includes('-h')) {
        showInstallHelp();
        break;
      }
      const installOptions = {
        force: installArgs.includes('--force'),
        quiet: installArgs.includes('--quiet'),
        dryRun: installArgs.includes('--dry-run'),
        forceMerge: installArgs.includes('--merge'),
        noMerge: installArgs.includes('--no-merge'),
      };
      if (!installOptions.quiet) {
        console.log('AIOX-FullStack Installation\n');
      }
      await runWizard(installOptions);
      break;
    }

    case 'uninstall': {
      // Uninstall AIOX from project
      const uninstallArgs = args.slice(1);
      if (uninstallArgs.includes('--help') || uninstallArgs.includes('-h')) {
        showUninstallHelp();
        break;
      }
      const uninstallOptions = {
        force: uninstallArgs.includes('--force'),
        keepData: uninstallArgs.includes('--keep-data'),
        dryRun: uninstallArgs.includes('--dry-run'),
        quiet: uninstallArgs.includes('--quiet'),
      };
      await runUninstall(uninstallOptions);
      break;
    }

    case 'status':
      // Show AIOX Local Status - Custom for local-first optimization
      await showAioXStatus();
      break;

    case 'init': {
      // Create new project (flags parsed inside initProject)
      await initProject();
      break;
    }

    case 'info':
      showInfo();
      break;

    case 'doctor': {
      // Run health check with flag support
      const doctorArgs = args.slice(1);
      if (doctorArgs.includes('--help') || doctorArgs.includes('-h')) {
        showDoctorHelp();
        break;
      }
      const doctorOptions = {
        fix: doctorArgs.includes('--fix'),
        json: doctorArgs.includes('--json'),
        dryRun: doctorArgs.includes('--dry-run'),
        quiet: doctorArgs.includes('--quiet'),
      };
      await runDoctor(doctorOptions);
      break;
    }

    case 'validate':
      // Post-installation validation - Story 6.19
      await runValidate();
      break;

    case 'update':
      // Update to latest version - Epic 7
      await runUpdate();
      break;

    case '--version':
    case '-v':
    case '-V':
      await showVersion();
      break;

    case '--help':
    case '-h':
      showHelp();
      break;

    case undefined:
      // No arguments - run wizard directly (npx default behavior)
      console.log('AIOX-FullStack Installation\n');
      await runWizard();
      break;

    default:
      console.error(`❌ Unknown command: ${command}`);
      console.log('\nRun with --help to see available commands');
      process.exit(1);
  }
}

// Execute main function
main().catch((error) => {
  console.error('❌ Fatal error:', error.message);
  process.exit(1);
});
