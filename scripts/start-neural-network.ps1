param(
    [string]$VaultPath = "C:\Users\expea\OneDrive\Documentos\DIto"
)

Write-Host "===================================================" -ForegroundColor Cyan
Write-Host "  🧠 AIOX Neural Network - Hive Mind Boot Sequence" -ForegroundColor Cyan
Write-Host "  Powered by local Ollama & Antigravity (GTX 1650 Optimized)" -ForegroundColor Cyan
Write-Host "===================================================" -ForegroundColor Cyan

# 1. Set environment variables
$env:NEURAL_BRAIN_PATH = $VaultPath
$env:AIOX_DEFAULT_AGENT = "neural"
Write-Host "[+] Local Obsidian Vault Target: $VaultPath" -ForegroundColor Green

# 2. Check Ollama
try {
    $ollamaStatus = Get-Process ollama -ErrorAction SilentlyContinue
    if (-not $ollamaStatus) {
        Write-Host "[!] Ollama is not running. Starting in background mode..." -ForegroundColor Yellow
        Start-Process -FilePath "ollama" -ArgumentList "serve" -WindowStyle Hidden
        Start-Sleep -Seconds 3
    } else {
        Write-Host "[+] Local Engine (Ollama) is active." -ForegroundColor Green
    }
} catch {
    Write-Host "[!] Warning: Cannot verify Ollama status." -ForegroundColor Yellow
}

# 3. Boot OpenClaude directly with the AIOX engine
Write-Host "[+] Connecting synapses... Booting OpenClaude." -ForegroundColor Green
node bin/aiox.js openclaude /agent neural
