$modsDir = 'C:/Users/expea/AppData/Roaming/.minecraft/versions/Mods teste 1.20.1/mods'

function Download-Modrinth([string]$slug) {
    Write-Host "🔍 Consultando API Modrinth para: $slug"
    $api = "https://api.modrinth.com/v2/project/$slug/version?game_versions=[`"1.20.1`"]&loaders=[`"forge`"]"
    try {
        $resp = Invoke-RestMethod -Uri $api -Method Get
        if ($resp.Count -gt 0) {
            $latest = $resp[0]
            $file = $latest.files | Where-Object { $_.primary -eq $true }
            if (-not $file) { $file = $latest.files[0] }
            
            $url = $file.url
            $name = $file.filename
            $target = Join-Path $modsDir $name
            
            Write-Host "📥 Baixando $name..."
            Invoke-WebRequest -Uri $url -OutFile $target -UserAgent 'Mozilla/5.0'
            Write-Host "✅ Sucesso!"
        } else {
            Write-Host "⚠️ Nenhuma versão encontrada para $slug (1.20.1 Forge)"
        }
    } catch {
        Write-Host "❌ Erro ao processar $slug: $($_.Exception.Message)"
    }
}

# Criar pasta se não existir (sanity check)
if (-not (Test-Path $modsDir)) { New-Item -ItemType Directory -Path $modsDir -Force }

# Lista de mods para injeção
Download-Modrinth "immediatelyfast"
Download-Modrinth "canary"
Download-Modrinth "alternate-current"
