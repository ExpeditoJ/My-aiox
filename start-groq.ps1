Write-Host "`n[Orion] Injetando Motor Groq na ignição do OpenClaude...`n" -ForegroundColor Cyan

# Padrão de API configurado para a LPU Groq:
$env:CLAUDE_CODE_USE_OPENAI="1" 
$env:OPENAI_BASE_URL="https://api.groq.com/openai/v1"
# A key garantida no workspace:
$env:OPENAI_API_KEY="SUA_GROQ_API_KEY_AQUI"
$env:OPENAI_MODEL="llama-3.3-70b-versatile" 

Write-Host "Portal estabilizado. Inicializando o Agente de Terminal...`n" -ForegroundColor Green
openclaude
