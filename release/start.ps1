Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'
Set-Location $PSScriptRoot
Write-Host 'Starting WebNovel Writer...'
if (Test-Path "$PSScriptRoot\server.log") { Remove-Item "$PSScriptRoot\server.log" -Force }
Start-Process -WindowStyle Minimized -FilePath "$PSScriptRoot\node.exe" -ArgumentList 'server.js' -WorkingDirectory $PSScriptRoot -RedirectStandardOutput "$PSScriptRoot\server.log" -RedirectStandardError "$PSScriptRoot\server.log"
$url = 'http://127.0.0.1:3000'
for ($i = 0; $i -lt 60; $i++) {
  try {
    $response = Invoke-WebRequest -Uri $url -UseBasicParsing -TimeoutSec 2
    if ($response.StatusCode -ge 200 -and $response.StatusCode -lt 500) { break }
  } catch { }
  Start-Sleep -Seconds 1
}
Start-Process $url
Write-Host "Opened $url"
