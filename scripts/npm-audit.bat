@echo off
setlocal
cd /d "%~dp0..\app"

if exist "%ProgramFiles%\nodejs\npm.cmd" (
  set "NPM=%ProgramFiles%\nodejs\npm.cmd"
  goto run
)

if exist "%LocalAppData%\fnm_multishells" (
  for /f "delims=" %%D in ('dir /b /ad "%LocalAppData%\fnm_multishells" 2^>nul') do (
    if exist "%LocalAppData%\fnm_multishells\%%D\npm.cmd" (
      set "NPM=%LocalAppData%\fnm_multishells\%%D\npm.cmd"
      goto run
    )
  )
)

where npm >nul 2>&1 && set "NPM=npm" && goto run

echo Node.js/npm was not found on this machine.
echo Install from https://nodejs.org/ then rerun:
echo   scripts\npm-audit.bat
exit /b 1

:run
echo Using npm: %NPM%
if not exist node_modules (
  echo Installing dependencies...
  call "%NPM%" install
)
echo.
echo === npm audit ===
call "%NPM%" audit
echo.
echo === safe fixes ===
call "%NPM%" audit fix
exit /b %ERRORLEVEL%