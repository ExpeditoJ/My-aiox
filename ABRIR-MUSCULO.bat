@echo off
title 🦾 AIOX Músculo (Direct)
setlocal
cd /d "%~dp0"

set CLAUDE_CODE_USE_OPENAI=1
set OPENAI_BASE_URL=http://localhost:3100/v1
set OPENAI_API_KEY=local-engine
set OPENAI_MODEL=aiox-turbo
set OPENCLAUDE_ARGS=--dangerously-skip-permissions

start /b node scripts\api-pool-proxy.js >nul 2>&1
ping 127.0.0.1 -n 3 > nul

node packages\openclaude-src\dist\cli.mjs %OPENCLAUDE_ARGS%

pause
endlocal
