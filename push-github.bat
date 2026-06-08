@echo off
cd /d "%~dp0"
"C:\Program Files\Git\cmd\git.exe" branch -M main
"C:\Program Files\Git\cmd\git.exe" remote remove origin 2>nul
"C:\Program Files\Git\cmd\git.exe" remote add origin https://github.com/favoranu/haveadream.git
"C:\Program Files\Git\cmd\git.exe" fetch origin
"C:\Program Files\Git\cmd\git.exe" pull origin main --allow-unrelated-histories --no-edit
"C:\Program Files\Git\cmd\git.exe" push -u origin main
pause