# reprogram-mod-bytecode.ps1
param(
    [string]$JarPath,
    [string]$ClassPathToRemove
)

Add-Type -AssemblyName "System.IO.Compression"
Add-Type -AssemblyName "System.IO.Compression.FileSystem"

Write-Host "Starting Bytecode Surgery: $JarPath"

if (-not (Test-Path $JarPath)) {
    Write-Error "Error: Mod JAR not found."
    exit 1
}

try {
    $zip = [System.IO.Compression.ZipFile]::Open($JarPath, "Update")
    $entry = $zip.GetEntry($ClassPathToRemove)

    if ($null -eq $entry) {
        Write-Host "Warning: Class $ClassPathToRemove not found. Already patched?"
    } else {
        Write-Host "Removing class: $ClassPathToRemove"
        $entry.Delete()
        Write-Host "Success: Class removed."
    }
    
    $zip.Dispose()
    Write-Host "Surgery completed."

} catch {
    Write-Error "Critical Failure: $($_.Exception.Message)"
    if ($zip) { $zip.Dispose() }
    exit 1
}
