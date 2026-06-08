param(
  [string]$BaseUrl = "https://haveadream.pages.dev"
)

$rpcUrl = "$BaseUrl/api/rpc"
$healthUrl = "$BaseUrl/api/health"
$body = '{"jsonrpc":"2.0","id":1,"method":"getVersion"}'
$headers = @{
  "Content-Type" = "application/json"
  "Origin"       = $BaseUrl
}

Write-Host "Target: $BaseUrl"

Write-Host "=== Health check ==="
try {
  $health = Invoke-WebRequest -Uri $healthUrl -UseBasicParsing -TimeoutSec 20
  Write-Host "GET /api/health -> $($health.StatusCode) $($health.Content)"
} catch {
  $code = if ($_.Exception.Response) { [int]$_.Exception.Response.StatusCode } else { "ERR" }
  Write-Host "GET /api/health -> $code $($_.Exception.Message)"
}

Write-Host "`n=== RPC burst test (30 requests) ==="
$results = @{}
1..30 | ForEach-Object {
  try {
    $res = Invoke-WebRequest -Uri $rpcUrl -Method POST -Headers $headers -Body $body -UseBasicParsing -TimeoutSec 20
    $code = [string]$res.StatusCode
  } catch {
    $code = if ($_.Exception.Response) { [string][int]$_.Exception.Response.StatusCode } else { "ERR" }
  }
  if ($results.ContainsKey($code)) { $results[$code]++ } else { $results[$code] = 1 }
  Start-Sleep -Milliseconds 80
}

$results.GetEnumerator() | Sort-Object Name | ForEach-Object {
  Write-Host "$($_.Name): $($_.Value) responses"
}

Write-Host "`n429 = rate limit. 403 = WAF/origin/method block."

if ($BaseUrl -ne "https://app.haveadream.xyz") {
  Write-Host "`n=== Custom domain spot check ==="
  & $PSCommandPath -BaseUrl "https://app.haveadream.xyz"
}