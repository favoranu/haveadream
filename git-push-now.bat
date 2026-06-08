@echo off
cd /d "%~dp0"
"C:\Program Files\Git\cmd\git.exe" add -A
"C:\Program Files\Git\cmd\git.exe" status
"C:\Program Files\Git\cmd\git.exe" commit -m "Add Turnstile, fix Pages project name, remove invalid redirects"
"C:\Program Files\Git\cmd\git.exe" push origin main