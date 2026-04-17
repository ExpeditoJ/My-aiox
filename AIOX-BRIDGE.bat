@echo off
title 🌐 AIOX Remote Bridge (Celular ^& Alexa)
setlocal
cd /d "%~dp0"

echo ===================================================
echo     AIOX REMOTE BRIDGE (Telemetria e Controle)
echo ===================================================
echo.

:: Opcional: O usuário pode editar essas variáveis diretamente no arquivo
set TELEGRAM_BOT_TOKEN=8740188865:AAH-Uzk_5NLHpTH52KJ4qgE3FJJbaV1JgBk
set NGROK_AUTHTOKEN=3CSlAEmOhH2kYgLQsatFirhg8Hf_3YycVQVr1f2VUDYd8EYqd

echo [1/2] Iniciando Neural Router (Proxy) no background...
:: Verifica se já está rodando
netstat -ano | findstr ":3100 " >nul
if %errorlevel% neq 0 (
    start /b node scripts\api-pool-proxy.js >nul 2>&1
    echo   - Proxy ativado com sucesso.
) else (
    echo   - Proxy já está em execução.
)

echo [2/2] Estabelecendo ponte segura (Ngrok + Express)...
node scripts\aiox-bridge.js

pause
endlocal
