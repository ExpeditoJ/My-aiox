# AIOX OpenClaude + Gemma Local Launcher
# ═══════════════════════════════════════
# Motor: Google Gemma 3 (4B) via Ollama
# Hardware: Otimizado GTX 1650 (4GB VRAM)
# MCP: AIOX Hub (10 tools) + Memory Engine

Write-Host "`n👑 [Orion] Ignição do OpenClaude com Motor LOCAL Gemma 3...`n" -ForegroundColor Cyan

# Configurar para OpenAI-compatible Ollama endpoint
$env:CLAUDE_CODE_USE_OPENAI = "1"
$env:OPENAI_BASE_URL = "http://localhost:11434/v1"
$env:OPENAI_API_KEY = "not-needed"
$env:OPENAI_MODEL = "gemma3:4b"

# Garantir que Ollama está rodando
$ollamaCheck = $null
try { $ollamaCheck = Invoke-RestMethod -Uri "http://localhost:11434/" -TimeoutSec 2 -ErrorAction SilentlyContinue } catch {}

if (-not $ollamaCheck) {
    Write-Host "⚡ Ollama não detectado. Iniciando motor local..." -ForegroundColor Yellow
    Start-Process -FilePath "ollama" -ArgumentList "serve" -WindowStyle Hidden
    Start-Sleep -Seconds 3
    Write-Host "✅ Ollama inicializado." -ForegroundColor Green
} else {
    Write-Host "✅ Ollama já está rodando." -ForegroundColor Green
}

Write-Host "🧠 Modelo: Gemma 3 (4B) — Google Open Source" -ForegroundColor Magenta
Write-Host "🔧 MCP: AIOX Hub (10 tools) ativo" -ForegroundColor DarkCyan
Write-Host "📁 Vault: My Games (Obsidian sync)" -ForegroundColor DarkCyan
Write-Host "`nPortal estabilizado. Inicializando Terminal Agentes...`n" -ForegroundColor Green

openclaude --dangerously-skip-permissions
