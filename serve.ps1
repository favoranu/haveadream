param([int]$Port = 3000)

$Root = Join-Path $PSScriptRoot "public"
$SubscribersFile = Join-Path $PSScriptRoot "subscribers.json"

$Mime = @{
  ".html" = "text/html; charset=utf-8"
  ".css"  = "text/css; charset=utf-8"
  ".js"   = "application/javascript; charset=utf-8"
  ".json" = "application/json; charset=utf-8"
  ".ico"  = "image/x-icon"
  ".svg"  = "image/svg+xml"
  ".png"  = "image/png"
  ".jpg"  = "image/jpeg"
  ".jpeg" = "image/jpeg"
  ".mp4"  = "video/mp4"
  ".pdf"  = "application/pdf"
  ".doc"  = "application/msword"
}

function Get-Subscribers {
  if (Test-Path $SubscribersFile) {
    return Get-Content $SubscribersFile -Raw | ConvertFrom-Json
  }
  return @()
}

function Save-Subscriber([string]$Email) {
  $list = @(Get-Subscribers)
  if ($list | Where-Object { $_.email -eq $Email }) {
    return $false
  }
  $entry = [PSCustomObject]@{
    email        = $Email
    subscribedAt = (Get-Date).ToUniversalTime().ToString("o")
  }
  $json = (@($list) + $entry | ConvertTo-Json -Depth 3)
  [System.IO.File]::WriteAllText($SubscribersFile, $json, [System.Text.UTF8Encoding]::new($false))
  return $true
}

function Send-Json($Response, [int]$Status, $Body) {
  $json = $Body | ConvertTo-Json -Compress
  $buffer = [System.Text.Encoding]::UTF8.GetBytes($json)
  $Response.StatusCode = $Status
  $Response.ContentType = "application/json; charset=utf-8"
  $Response.ContentLength64 = $buffer.Length
  $Response.OutputStream.Write($buffer, 0, $buffer.Length)
}

$listener = New-Object System.Net.HttpListener
$listener.Prefixes.Add("http://localhost:$Port/")
$listener.Start()

Write-Host "HAD landing page running at http://localhost:$Port"
Write-Host "Press Ctrl+C to stop."

try {
  while ($listener.IsListening) {
    $context = $listener.GetContext()
    $request = $context.Request
    $response = $context.Response

    try {
      if ($request.HttpMethod -eq "POST" -and $request.Url.AbsolutePath -eq "/api/subscribe") {
        $reader = New-Object System.IO.StreamReader($request.InputStream, $request.ContentEncoding)
        $body = $reader.ReadToEnd()
        $reader.Close()

        $parsed = $body | ConvertFrom-Json
        $email = ($parsed.email -as [string]).Trim().ToLower()

        if (-not $email -or $email -notmatch "^[^\s@]+@[^\s@]+\.[^\s@]+$") {
          Send-Json $response 400 @{ error = "Please provide a valid email address." }
        }
        elseif (-not (Save-Subscriber $email)) {
          Send-Json $response 409 @{ error = "This email is already subscribed." }
        }
        else {
          Send-Json $response 201 @{ success = $true; message = "Subscribed successfully." }
        }
        continue
      }

      $path = $request.Url.AbsolutePath
      if ($path -eq "/") { $path = "/index.html" }

      $filePath = Join-Path $Root ($path.TrimStart("/") -replace "/", [IO.Path]::DirectorySeparatorChar)
      $resolved = [IO.Path]::GetFullPath($filePath)

      if (-not $resolved.StartsWith([IO.Path]::GetFullPath($Root)) -or -not (Test-Path $resolved -PathType Leaf)) {
        $response.StatusCode = 404
        $buffer = [System.Text.Encoding]::UTF8.GetBytes("Not found")
        $response.OutputStream.Write($buffer, 0, $buffer.Length)
      }
      else {
        $ext = [IO.Path]::GetExtension($resolved).ToLower()
        $bytes = [System.IO.File]::ReadAllBytes($resolved)
        $response.StatusCode = 200
        $response.ContentType = $Mime[$ext]
        if (-not $response.ContentType) { $response.ContentType = "application/octet-stream" }
        $response.ContentLength64 = $bytes.Length
        $response.OutputStream.Write($bytes, 0, $bytes.Length)
      }
    }
    finally {
      $response.Close()
    }
  }
}
finally {
  $listener.Stop()
  $listener.Close()
}