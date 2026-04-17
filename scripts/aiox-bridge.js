const express = require('express');
const { Telegraf } = require('telegraf');
const bodyParser = require('body-parser');
const ngrok = require('@ngrok/ngrok');
const { spawn, exec } = require('child_process');
const fs = require('fs');
const path = require('path');

// ── Configuration ──
const PORT = process.env.AIOX_BRIDGE_PORT || 3200;
const TELEGRAM_TOKEN = process.env.TELEGRAM_BOT_TOKEN || 'YOUR_TELEGRAM_BOT_TOKEN_HERE';
const NGROK_AUTHTOKEN = process.env.NGROK_AUTHTOKEN || '';

const app = express();
app.use(bodyParser.json());

// ── State ──
let isProcessing = false;
const queue = [];

// ── Native Executor (Garras) ──
async function executeClaws(response) {
  return new Promise((resolve) => {
    // Look for tool_code JSON
    const toolCodeMatch = response.match(/```tool_code\n([\s\S]*?)```/);
    if (toolCodeMatch) {
      try {
        const toolJson = JSON.parse(toolCodeMatch[1].trim());
        if (toolJson.command) {
          console.log(`[CLAWS] Executing JSON command: ${toolJson.command}`);
          return execCommand(toolJson.command, resolve, response);
        }
      } catch (e) {
        // Not JSON, or no command property, fall through
      }
    }

    // Look for bash or powershell blocks
    const bashMatch = response.match(/```(?:bash|powershell|cmd)\n([\s\S]*?)```/);
    if (bashMatch) {
      const cmd = bashMatch[1].trim();
      console.log(`[CLAWS] Executing raw command: ${cmd}`);
      return execCommand(cmd, resolve, response);
    }

    // No executable blocks found
    resolve(response);
  });
}

function execCommand(cmd, resolve, originalResponse) {
  // Danger zone: Executing arbitrary commands on the host machine
  exec(cmd, { cwd: path.join(__dirname, '..') }, (error, stdout, stderr) => {
    let result = `\n\n⚡ **[AIOX NATIVE CLAWS] Execução Concluída:**\n`;
    if (stdout) result += `\`\`\`\n${stdout.substring(0, 1500)}\n\`\`\``;
    if (stderr) result += `\n⚠️ Erro:\n\`\`\`\n${stderr.substring(0, 500)}\n\`\`\``;
    if (error) result += `\n❌ Falha: ${error.message}`;
    
    resolve(originalResponse + result);
  });
}

// ── OpenClaude Execution (Headless) ──
function runOpenClaude(prompt, onData, onEnd, onError) {
  const env = { ...process.env };
  env.CLAUDE_CODE_USE_OPENAI = '1';
  env.OPENAI_BASE_URL = 'http://127.0.0.1:3100/v1';
  env.OPENAI_API_KEY = 'local-engine';
  env.OPENAI_MODEL = 'aiox-muscle-v4';
  
  const args = [
    path.join(__dirname, '..', 'packages', 'openclaude-src', 'dist', 'cli.mjs'),
    prompt,
    '--dangerously-skip-permissions',
    '--append-system-prompt',
    '"VOCÊ É O MÚSCULO AIOX. Responda em PT-BR. Se precisar executar um comando, responda com o código num bloco markdown. O AIOX Bridge executará para você."'
  ];

  console.log(`[EXEC] Spawning OpenClaude: ${prompt.substring(0, 50)}...`);
  
  const child = spawn('node', args, { env, cwd: path.join(__dirname, '..') });
  
  let fullOutput = '';

  child.stdout.on('data', (data) => {
    const cleanChunk = data.toString().replace(/[\u001b\u009b][[()#;?]*(?:[0-9]{1,4}(?:;[0-9]{0,4})*)?[0-9A-ORZcf-nqry=><]/g, '');
    fullOutput += cleanChunk;
  });

  child.stderr.on('data', (data) => {
    console.error(`[EXEC ERROR] ${data}`);
  });

  child.on('close', async (code) => {
    console.log(`[EXEC] Finished with code ${code}`);
    let finalOutput = fullOutput.trim();
    
    // Pass output through Native Claws to intercept and run commands
    finalOutput = await executeClaws(finalOutput);
    
    if (onEnd) onEnd(finalOutput);
  });
  
  child.on('error', (err) => {
    if (onError) onError(err);
  });
}

// ── Queue System (Protects VRAM) ──
function processQueue() {
  if (isProcessing || queue.length === 0) return;
  
  isProcessing = true;
  const task = queue.shift();
  
  task.callback(() => {
    isProcessing = false;
    processQueue();
  });
}

function enqueueTask(prompt, respondFn) {
  queue.push({
    prompt,
    callback: (done) => {
      runOpenClaude(
        prompt,
        null,
        (finalOutput) => {
          respondFn(finalOutput);
          done();
        },
        (err) => {
          respondFn(`❌ Erro crítico: ${err.message}`);
          done();
        }
      );
    }
  });
  processQueue();
}

// ── Telegram Bot ──
let bot;
if (TELEGRAM_TOKEN && TELEGRAM_TOKEN !== 'YOUR_TELEGRAM_BOT_TOKEN_HERE') {
  bot = new Telegraf(TELEGRAM_TOKEN);
  
  bot.start((ctx) => ctx.reply('🤖 AIOX Remote Bridge Online. Garras Nativas ativadas! Mande um comando.'));
  
  bot.on('text', (ctx) => {
    const prompt = ctx.message.text;
    const position = queue.length;
    
    if (position > 0) {
      ctx.reply(`⏳ Comando na fila (Posição: ${position}). Aguarde...`);
    } else {
      ctx.reply('⚙️ AIOX processando o comando...');
    }
    
    enqueueTask(prompt, (response) => {
      if (response.length > 4000) {
        ctx.reply(response.substring(0, 4000) + '\n\n[...Trunced...]');
      } else {
        ctx.reply(response || "⚠️ Execução concluída, mas não houve saída de texto.");
      }
    });
  });

  bot.launch();
  console.log('[TELEGRAM] Bot iniciado com sucesso. Garras nativas ligadas.');
} else {
  console.warn('[TELEGRAM] Token não configurado. Defina TELEGRAM_BOT_TOKEN no ambiente.');
}

// ── Server & Ngrok Tunnel ──
app.listen(PORT, async () => {
  console.log(`\n👑 AIOX Bridge Server escutando na porta ${PORT}`);
  
  try {
    const listener = await ngrok.forward({ addr: PORT, authtoken: NGROK_AUTHTOKEN });
    console.log(`🌐 [NGROK] Túnel Estabelecido: ${listener.url()}`);
    console.log(`👉 Use esta URL no Amazon Developer Console para a Alexa: ${listener.url()}/alexa-webhook`);
    fs.writeFileSync(path.join(__dirname, 'bridge-url.txt'), listener.url());
  } catch (err) {
    console.error(`[NGROK ERROR] Falha ao iniciar túnel: ${err.message}`);
  }
});

process.once('SIGINT', () => { if(bot) bot.stop('SIGINT'); process.exit(0); });
process.once('SIGTERM', () => { if(bot) bot.stop('SIGTERM'); process.exit(0); });
