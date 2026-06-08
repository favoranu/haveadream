$edge = "C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe"
$html = "file:///C:/Users/nomad/had-token/public/whitepaper-print.html"
$pdf = "C:\Users\nomad\had-token\public\whitepaper.pdf"
$log = "C:\Users\nomad\had-token\pdf-log.txt"

if (Test-Path $pdf) { Remove-Item $pdf -Force }

$proc = Start-Process -FilePath $edge -ArgumentList @(
  "--headless=new",
  "--disable-gpu",
  "--no-pdf-header-footer",
  "--print-to-pdf=$pdf",
  $html
) -PassThru -Wait -NoNewWindow

if (Test-Path $pdf) {
  "OK $((Get-Item $pdf).Length) bytes exit=$($proc.ExitCode)" | Out-File $log
} else {
  "FAIL exit=$($proc.ExitCode)" | Out-File $log
  exit 1
}