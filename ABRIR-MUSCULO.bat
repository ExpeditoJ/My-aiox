@echo off
title 🦾 AIOX Músculo (Neural Router)
setlocal
cd /d "%~dp0"

:: ── CONFIGURAÇÃO DE ROTEAMENTO (Proxy v3.0) ──
set CLAUDE_CODE_USE_OPENAI=1
set OPENAI_BASE_URL=http://127.0.0.1:3100/v1
set OPENAI_API_KEY=local-engine
:: O Proxy decidirá o modelo, mas passamos aiox-muscle-v4 como pedido inicial
set OPENAI_MODEL=aiox-muscle-v4
set OPENCLAUDE_ARGS=--dangerously-skip-permissions --append-system-prompt "VOCÊ É O MÚSCULO AIOX. Responda em PT-BR. Use ferramentas."

echo [1/2] Iniciando Neural Router (Proxy)...
start /b node scripts\api-pool-proxy.js >nul 2>&1
ping 127.0.0.1 -n 3 > nul

echo [2/2] Conectando ao orquestrador local...
node packages\openclaude-src\dist\cli.mjs %OPENCLAUDE_ARGS%

pause
endlocal
