# AIOX OpenClaude Unified Launcher
# Este script agora delega TUDO para o Wrapper Nativo v2 em bin/aiox.js
# O Wrapper detecta automaticamente o provedor (Gemini/Groq/OpenAI) pela chave armazenada.
# Não é mais necessário setar variáveis manualmente!

Write-Host "Delegando para AIOX OpenClaude Runner v2..." -ForegroundColor Cyan
node bin/aiox.js openclaude $args
