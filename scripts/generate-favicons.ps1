Add-Type -AssemblyName System.Drawing

$src = Join-Path $PSScriptRoot "..\public\images\had.unstoppable_1024x1024.PNG"
$targets = @(
  @{ Size = 16; Name = "favicon-16x16.png" },
  @{ Size = 32; Name = "favicon-32x32.png" },
  @{ Size = 180; Name = "apple-touch-icon.png" },
  @{ Size = 192; Name = "icon-192.png" },
  @{ Size = 512; Name = "icon-512.png" }
)
$dirs = @(
  (Join-Path $PSScriptRoot "..\public"),
  (Join-Path $PSScriptRoot "..\app\public")
)

$image = [System.Drawing.Image]::FromFile($src)

foreach ($dir in $dirs) {
  if (-not (Test-Path $dir)) {
    New-Item -ItemType Directory -Path $dir | Out-Null
  }

  foreach ($t in $targets) {
    $bmp = New-Object System.Drawing.Bitmap $t.Size, $t.Size
    $g = [System.Drawing.Graphics]::FromImage($bmp)
    $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
    $g.DrawImage($image, 0, 0, $t.Size, $t.Size)
    $path = Join-Path $dir $t.Name
    $bmp.Save($path, [System.Drawing.Imaging.ImageFormat]::Png)
    $g.Dispose()
    $bmp.Dispose()
  }

  Copy-Item (Join-Path $dir "favicon-32x32.png") (Join-Path $dir "favicon.png") -Force

  $icoPath = Join-Path $dir "favicon.ico"
  $icon32 = New-Object System.Drawing.Bitmap (Join-Path $dir "favicon-32x32.png")
  $icon16 = New-Object System.Drawing.Bitmap (Join-Path $dir "favicon-16x16.png")
  $iconHandle = $icon32.GetHicon()
  $icon = [System.Drawing.Icon]::FromHandle($iconHandle)
  $fs = [System.IO.File]::Create($icoPath)
  $icon.Save($fs)
  $fs.Close()
  $icon.Dispose()
  $icon32.Dispose()
  $icon16.Dispose()
}

$image.Dispose()
Write-Host "Favicons generated in public/ and app/public/"