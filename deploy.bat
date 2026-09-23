@echo off
REM Rebuild Astro and deploy static files to the XAMPP document root.
cd /d "%~dp0"

set WP_API_URL=http://localhost/fhmcaz/blog/wp-json/wp/v2
call npm run build
if errorlevel 1 exit /b 1

powershell -NoProfile -Command ^
  "$dist='%~dp0dist'; $root='%~dp0..'; Get-ChildItem $dist | ForEach-Object { if ($_.Name -in @('blog','frontend','_extract')) { return }; $dest=Join-Path $root $_.Name; if (Test-Path $dest) { Remove-Item $dest -Recurse -Force }; Copy-Item $_.FullName $dest -Recurse -Force; Write-Host ('DEPLOYED ' + $_.Name) }"

echo Deploy complete. Public site: http://localhost/fhmcaz/
echo WP admin: http://localhost/fhmcaz/blog/wp-admin/
