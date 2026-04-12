# AIOX OpenClaw + Gemma 3 Local Launcher
# ═══════════════════════════════════════
# Gateway: OpenClaw (AI Agent Orchestrator)
# Motor: Google Gemma 3 (4B) via Ollama
# Hardware: Otimizado GTX 1650 (4GB VRAM)
# MCP: AIOX Hub (10 tools)

Write-Host "`n🚀 [Orion] Decolagem do OpenClaw com Motor Gemma 3..." -ForegroundColor Cyan

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

Write-Host "🧠 Modelo: Gemma 3 (4B)" -ForegroundColor Magenta
Write-Host "🔧 MCP: AIOX Hub integrado" -ForegroundColor DarkCyan
Write-Host "📁 Vault: My Games (Obsidian)" -ForegroundColor DarkCyan
Write-Host "`nSincronizando sinapses... Indo para o terminal OpenClaw.`n" -ForegroundColor Green

# Iniciar OpenClaw
# --yolo pula permissões de ferramentas por padrão conforme seu perfil de automação
openclaw --yolo
