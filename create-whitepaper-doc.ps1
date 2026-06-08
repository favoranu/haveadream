$ErrorActionPreference = 'Stop'

$htmlPath = Join-Path $PSScriptRoot 'public\whitepaper-print.html'
$docPath  = Join-Path $PSScriptRoot 'public\HAD-Whitepaper-v1.1.doc'
$chartPath = Join-Path $PSScriptRoot 'public\images\had-tokenomics.png'

if (-not (Test-Path $htmlPath)) { throw "Missing $htmlPath" }

$htmlUri = 'file:///' + ($htmlPath -replace '\\', '/')

$word = New-Object -ComObject Word.Application
$word.Visible = $false

try {
  if (Test-Path $docPath) { Remove-Item $docPath -Force }

  $doc = $word.Documents.Open($htmlUri)

  # Insert tokenomics chart after "Tokenomics" section if image exists
  if (Test-Path $chartPath) {
    $find = $doc.Content.Find
    $find.ClearFormatting()
    $found = $find.Execute('Total supply:')
    if ($found) {
      $range = $doc.Content
      $range.Collapse(0) # wdCollapseEnd
      $range.InsertParagraphAfter() | Out-Null
      $range.InsertParagraphAfter() | Out-Null
      $picRange = $doc.Paragraphs.Item($doc.Paragraphs.Count - 1).Range
      $picRange.InlineShapes.AddPicture($chartPath) | Out-Null
      $picRange.ParagraphFormat.Alignment = 1 # center
    }
  }

  # wdFormatDocument = 0 (.doc)
  $doc.SaveAs2($docPath, 0)
  $doc.Close($false)

  Write-Host "Created: $docPath"
  Write-Host "Size: $((Get-Item $docPath).Length) bytes"
}
finally {
  $word.Quit()
  [System.Runtime.Interopservices.Marshal]::ReleaseComObject($word) | Out-Null
  [GC]::Collect()
  [GC]::WaitForPendingFinalizers()
}