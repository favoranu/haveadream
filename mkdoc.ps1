$ErrorActionPreference = 'Stop'

$docPath  = 'C:\Users\nomad\had-token\public\HAD-Whitepaper-v1.1.doc'
$htmlPath = 'C:\Users\nomad\had-token\public\whitepaper-print.html'
$tmpPath  = "$docPath.tmp"

if (-not (Test-Path $htmlPath)) { throw "Missing $htmlPath" }

$htmlUri = 'file:///' + ($htmlPath -replace '\\', '/')
$word = New-Object -ComObject Word.Application
$word.Visible = $false

try {
  $doc = $word.Documents.Open($htmlUri)
  if (Test-Path $tmpPath) { Remove-Item $tmpPath -Force }
  $doc.SaveAs2($tmpPath, 0)
  $doc.Close($false)

  if (Test-Path $docPath) { Remove-Item $docPath -Force }
  Move-Item $tmpPath $docPath -Force
  'OK'
}
finally {
  if (Test-Path $tmpPath) { Remove-Item $tmpPath -Force -ErrorAction SilentlyContinue }
  $word.Quit()
  [System.Runtime.Interopservices.Marshal]::ReleaseComObject($word) | Out-Null
  [GC]::Collect()
  [GC]::WaitForPendingFinalizers()
}