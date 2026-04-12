# AIOX Setup — Configuração Automática do Assistente (Local-First)
# Este script atualiza o settings.json do Antigravity para usar o Proxy Local na porta 3100.

$settingsPath = "$env:APPDATA\Antigravity\User\settings.json"

if (-Not (Test-Path $settingsPath)) {
    Write-Host "⚠️ Arquivo settings.json não encontrado em $settingsPath" -ForegroundColor Yellow
    exit 1
}

$settings = Get-Content $settingsPath | ConvertFrom-Json

# Verificar se as configurações de IA já existem ou adicionar as novas
# Antigravity usa chaves específicas para modelos customizados

$newConfig = @{
    "antigravity.modelSelection" = "Local AIOX"
    "antigravity.customModels" = @(
        @{
            "id" = "Local AIOX"
            "name" = "Local AIOX (Qwen 3B - GTX 1650 Optimized)"
            "baseUrl" = "http://localhost:3100/v1"
            "apiKey" = "ollama"
            "model" = "qwen2.5-coder:3b"
            "default" = $true
        }
    )
}

# Mesclar as novas configs no JSON atual
foreach ($key in $newConfig.Keys) {
    $settings | Add-Member -MemberType NoteProperty -Name $key -Value $newConfig[$key] -Force
}

$settings | ConvertTo-Json -Depth 10 | Set-Content $settingsPath

Write-Host "✅ Configuração aplicada com sucesso!" -ForegroundColor Green
Write-Host "🚀 Reinicie o Antigravity para carregar o modelo 'Local AIOX'." -ForegroundColor Cyan
