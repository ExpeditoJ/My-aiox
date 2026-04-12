# patch-mod-mixin.ps1
param(
    [string]$JarPath,
    [string]$TargetFileInJar = "embeddium.mixins.json",
    [string]$MixinToRemove = "features.render.world.ClientLevelMixin"
)

Add-Type -AssemblyName "System.IO.Compression"
Add-Type -AssemblyName "System.IO.Compression.FileSystem"

Write-Host "Starting Patch for: $JarPath"

if (-not (Test-Path $JarPath)) {
    Write-Error "Error: Mod JAR not found."
    exit 1
}

$tempDir = Join-Path $env:TEMP "AIOX_Patch_$(Get-Date -Format 'yyyyMMddHHmmss')"
New-Item -ItemType Directory -Path $tempDir | Out-Null

try {
    $zip = [System.IO.Compression.ZipFile]::Open($JarPath, "Update")
    $entry = $zip.GetEntry($TargetFileInJar)

    if ($null -eq $entry) {
        Write-Error "Error: $TargetFileInJar not found inside JAR."
        if ($zip) { $zip.Dispose() }
        exit 1
    }

    $extractedFilePath = Join-Path $tempDir $TargetFileInJar
    [System.IO.Compression.ZipFileExtensions]::ExtractToFile($entry, $extractedFilePath, $true)

    Write-Host "Modifying Mixin JSON..."
    $content = Get-Content $extractedFilePath -Raw
    $json = $content | ConvertFrom-Json
    
    if ($json.mixins -contains $MixinToRemove) {
        $json.mixins = $json.mixins | Where-Object { $_ -ne $MixinToRemove }
        Write-Host "Removed Mixin: $MixinToRemove"
    } else {
        Write-Host "Warning: Mixin not found. No changes made."
    }

    $jsonContent = $json | ConvertTo-Json -Depth 10
    $jsonContent | Set-Content $extractedFilePath -NoNewline

    Write-Host "Injecting patch back to JAR..."
    $entry.Delete()
    [System.IO.Compression.ZipFileExtensions]::CreateEntryFromFile($zip, $extractedFilePath, $TargetFileInJar)

    $zip.Dispose()
    Write-Host "Success: Patch applied."

} catch {
    Write-Error "Critical Failure: $($_.Exception.Message)"
} finally {
    if ($zip) { $zip.Dispose() }
    Remove-Item -Path $tempDir -Recurse -Force -ErrorAction SilentlyContinue
}
