@echo off
cd /d "%~dp0"
"C:\Program Files\Git\cmd\git.exe" add git-push-now.bat
"C:\Program Files\Git\cmd\git.exe" commit -m "Update push script" 2>nul
"C:\Program Files\Git\cmd\git.exe" stash push -u -m "temp" 2>nul
"C:\Program Files\Git\cmd\git.exe" pull origin main --rebase
"C:\Program Files\Git\cmd\git.exe" push origin main
"C:\Program Files\Git\cmd\git.exe" stash pop 2>nul