$env:CLAUDE_CODE_USE_OPENAI="1"
$env:OPENAI_BASE_URL="https://api.groq.com/openai/v1"
$env:OPENAI_API_KEY="SUA_GROQ_API_KEY_AQUI"
$env:OPENAI_MODEL="llama-3.3-70b-versatile"

Write-Host "Iniciando OpenClaude via Groq (llama-3.3-70b-versatile) com Modo Automático YOLO ativado..." -ForegroundColor Cyan
openclaude --dangerously-skip-permissions
