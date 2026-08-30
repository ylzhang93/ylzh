@echo off
REM ============================================
REM  zyl personal site - push to GitHub Pages
REM  Uses SSH (git@github.com:ylzhang93/ylzh.git)
REM  If your key has a passphrase, enter it when
REM  prompted. Double-click to run.
REM ============================================
cd /d "%~dp0"

git remote add origin git@github.com:ylzhang93/ylzh.git 2>nul || git remote set-url origin git@github.com:ylzhang93/ylzh.git

echo.
echo Pushing main branch via SSH: git@github.com:ylzhang93/ylzh.git
echo If asked for a passphrase, type it and press Enter.
echo.
git push -u origin main

echo.
if %errorlevel%==0 (
  echo.
  echo SUCCESS! Now enable Pages:
  echo   GitHub repo ylzh - Settings - Pages
  echo   Source: Deploy from a branch - main - / (root) - Save
  echo.
) else (
  echo.
  echo PUSH FAILED - copy the error above and send it to zyl.
  echo.
)
pause
