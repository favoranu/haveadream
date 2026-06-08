Add-Type -AssemblyName System.Drawing

$out = Join-Path $PSScriptRoot "public\images\had-tokenomics.png"
$w = 800; $h = 800
$bmp = New-Object System.Drawing.Bitmap $w, $h
$g = [System.Drawing.Graphics]::FromImage($bmp)
$g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
$g.TextRenderingHint = [System.Drawing.Text.TextRenderingHint]::AntiAliasGridFit

$bg = [System.Drawing.Color]::FromArgb(255, 15, 12, 41)
$g.Clear($bg)

$slices = @(
  @{ Pct = 19.00;   Color = [System.Drawing.Color]::FromArgb(255, 255, 215, 0);   Label = "Team & Founder" }
  @{ Pct = 39.51;   Color = [System.Drawing.Color]::FromArgb(255, 0, 191, 255);   Label = "Treasury" }
  @{ Pct = 22.20;   Color = [System.Drawing.Color]::FromArgb(255, 255, 105, 180); Label = "Airdrop" }
  @{ Pct = 19.29;   Color = [System.Drawing.Color]::FromArgb(255, 50, 205, 50);  Label = "Ecosystem Incentives" }
)

$rect = New-Object System.Drawing.Rectangle 80, 80, 560, 560
$start = -90.0
$fontFamily = New-Object System.Drawing.FontFamily "Segoe UI"
$font = New-Object System.Drawing.Font($fontFamily, 11, [System.Drawing.FontStyle]::Bold)
$brushWhite = [System.Drawing.Brushes]::White
$brushGray = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(255, 175, 175, 175))

foreach ($s in $slices) {
  $sweep = 360.0 * ($s.Pct / 100.0)
  $brush = New-Object System.Drawing.SolidBrush $s.Color
  $g.FillPie($brush, $rect, [single]$start, [single]$sweep)
  $mid = [Math]::PI * ($start + $sweep / 2) / 180.0
  $cx = 360 + [Math]::Cos($mid) * 200
  $cy = 360 + [Math]::Sin($mid) * 200
  $g.DrawString("{0:N2}%" -f $s.Pct, $font, $brushWhite, ($cx - 24), ($cy - 10))
  $start += $sweep
}

$titleFont = New-Object System.Drawing.Font($fontFamily, 18, [System.Drawing.FontStyle]::Bold)
$g.DrawString('$HAD Token Allocation (10B Total Supply)', $titleFont, $brushWhite, 120, 24)

$y = 680
$sw = 18
foreach ($s in $slices) {
  $brush = New-Object System.Drawing.SolidBrush $s.Color
  $g.FillRectangle($brush, 120, $y, $sw, $sw)
  $g.DrawString("$($s.Label) - $($s.Pct)%", $font, $brushWhite, (120 + $sw + 10), ($y - 2))
  $y += 28
}

$bmp.Save($out, [System.Drawing.Imaging.ImageFormat]::Png)
$g.Dispose(); $bmp.Dispose()
Write-Host "Chart saved: $out"