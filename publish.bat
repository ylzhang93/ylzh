@echo off
REM ============================================
REM  zyl personal site - push to GitHub Pages
REM  Double-click to run. A GitHub login window
REM  will pop up on first push - sign in once.
REM ============================================
cd /d "%~dp0"

git remote add origin https://github.com/ylzhang93/ylzh.git 2>nul

echo.
echo Pushing main branch to https://github.com/ylzhang93/ylzh.git
echo If a GitHub login window appears, sign in as ylzhang93.
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
