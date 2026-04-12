# start-analise-mods.ps1
# Script AIOX (Antigravity PT-BR Mode): Automação Interativa

Write-Host "=====================================================" -ForegroundColor Cyan
Write-Host "🤖🚀 AIOX: PIPELINE DE DESCARGA E ANÁLISE DE MODS" -ForegroundColor Yellow
Write-Host "Integração: Ollama (Local) + OpenClaude(Groq) > Obsidian" -ForegroundColor Cyan
Write-Host "=====================================================" -ForegroundColor Cyan
Write-Host ""

$DefaultModpath = "C:\Users\expea\AppData\Roaming\.minecraft\versions\Mods teste 1.20.1\mods"
$DefaultVault = "C:\Users\expea\OneDrive\Documentos\My Games"

$ModpackPath = Read-Host "Path da pasta de mods [Default: $DefaultModpath]"
if ([string]::IsNullOrWhiteSpace($ModpackPath)) { $ModpackPath = $DefaultModpath }

$ObsidianPath = Read-Host "Path do cofre Obsidian [Default: $DefaultVault]"
if ([string]::IsNullOrWhiteSpace($ObsidianPath)) { $ObsidianPath = $DefaultVault }

if ([string]::IsNullOrWhiteSpace($ModpackPath) -or [string]::IsNullOrWhiteSpace($ObsidianPath)) {
    Write-Host "❌ Erro: Por favor insira caminhos válidos." -ForegroundColor Red
    exit 1
}

if (-Not (Test-Path $ModpackPath)) {
    Write-Host "❌ Erro: O diretório do modpack não foi encontrado: $ModpackPath" -ForegroundColor Red
    exit 1
}

if (-Not (Test-Path $ObsidianPath)) {
    Write-Host "❌ Erro: O diretório do Obsidian não foi encontrado: $ObsidianPath" -ForegroundColor Red
    exit 1
}

# Tentar carregar Groq API key do openclaude-groq.ps1 se OPENAI_API_KEY estiver vazia
if ([string]::IsNullOrEmpty($env:OPENAI_API_KEY)) {
    Write-Host "⚠️ Variável OPENAI_API_KEY não localizada globalmente. Injetando valores do openclaude-groq.ps1 se disponível..." -ForegroundColor DarkYellow
    $scriptConf = Join-Path -Path $PSScriptRoot -ChildPath "..\openclaude-groq.ps1"
    if (Test-Path $scriptConf) {
        . $scriptConf
        Write-Host "✅ Configurações de API carregadas via openclaude-groq.ps1" -ForegroundColor Green
    }
}

Write-Host "Iniciando auditoria no Node.js..." -ForegroundColor Cyan
node $(Join-Path -Path $PSScriptRoot -ChildPath "analyze-mods-descarga.js") $ModpackPath $ObsidianPath

Write-Host ""
Write-Host "Processamento concluído!" -ForegroundColor Green
