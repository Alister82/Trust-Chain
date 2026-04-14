# setup-foundry.ps1
# Direct Byte-Fetch for Foundry Windows Binaries (Bypass SSL Handshake 525 Error)

$foundryDir = "$PSScriptRoot\.foundry"
$binDir = "$foundryDir\bin"

if (!(Test-Path $binDir)) {
    New-Item -ItemType Directory -Force -Path $binDir
}

# Fetch the latest release for Windows from GitHub's API (Bypassing Paradigm's direct link issues)
$apiUri = "https://api.github.com/repos/foundry-rs/foundry/releases/latest"
Write-Host "Fetching latest release metadata from GitHub..." -ForegroundColor Cyan

try {
    $metadata = Invoke-RestMethod -Uri $apiUri
    $asset = $metadata.assets | Where-Object { $_.name -like "*windows-amd64*" }

    if ($null -eq $asset) {
        throw "Could not find a Windows amd64 asset in the latest release."
    }

    $downloadUrl = $asset.browser_download_url
    $zipFile = "$foundryDir\foundry.tar.gz"

    Write-Host "Downloading binaries from $downloadUrl..." -ForegroundColor Green
    Invoke-WebRequest -Uri $downloadUrl -OutFile $zipFile -UseBasicParsing

    Write-Host "Extracting binaries..." -ForegroundColor Yellow
    # Windows 10/11 have tar built in
    tar -xf $zipFile -C $binDir

    $anvilPath = "$binDir\anvil.exe"
    $forgePath = "$binDir\forge.exe"

    if (Test-Path $anvilPath) {
        Write-Host "`nReady! You can now run the node directly:" -ForegroundColor Green
        Write-Host "& '$anvilPath'" -ForegroundColor White
        
        # Add to current session PATH for immediate use
        $env:PATH += ";$binDir"
    } else {
        throw "Extraction failed: anvil.exe not found in bin directory."
    }
} catch {
    Write-Error "Foundry Setup Failed: $_"
    Write-Host "`nManual Alternative: Download 'foundry-windows-amd64.tar.gz' from https://github.com/foundry-rs/foundry/releases and extract to $binDir" -ForegroundColor Yellow
}
