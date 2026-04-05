@echo off
setlocal
echo ===================================================
echo   👑 AIOX OpenClaude - Terminal Engine 
echo   Powered by Gemini Native / Groq Pool Proxy
echo ===================================================
:: Wake up native Ollama engine invisibly if present
start /b ollama serve >nul 2>&1
node bin\aiox.js openclaude %*
endlocal
