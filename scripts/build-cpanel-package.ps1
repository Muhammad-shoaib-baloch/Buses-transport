# Builds a ready-to-upload zip for cPanel / Hostinger shared hosting.
#
#   powershell -ExecutionPolicy Bypass -File scripts\build-cpanel-package.ps1
#
# Output: build\busestransport-cpanel.zip containing
#   busestransport\   the Laravel app (with vendor\, production .env)  -> upload NEXT TO public_html
#   public_html\      public files + index.php pointing at ..\busestransport -> contents go INTO public_html
# and build\busestransport-database.sql — all tables + content, import it in phpMyAdmin.
$ErrorActionPreference = 'Stop'
$root = Split-Path -Parent $PSScriptRoot
$build = Join-Path $root 'build'
$stage = Join-Path $build 'package'
$app = Join-Path $stage 'busestransport'
$web = Join-Path $stage 'public_html'

Write-Host '1/7  Preparing folders...'
if (Test-Path $build) { Remove-Item $build -Recurse -Force }
New-Item -ItemType Directory -Force $app, $web | Out-Null

Write-Host '2/7  Copying the application...'
$exclude = @('vendor', 'node_modules', 'build', 'tests', '.git', '.idea', '.vscode', 'public')
robocopy $root $app /E /NFL /NDL /NJH /NJS /NP /XD $($exclude | ForEach-Object { Join-Path $root $_ }) /XF .env .env.backup dev-server.php phpunit.xml '*.zip' | Out-Null
# clean runtime folders but keep their structure
foreach ($d in 'storage\logs', 'storage\framework\cache\data', 'storage\framework\sessions', 'storage\framework\views') {
    $p = Join-Path $app $d
    New-Item -ItemType Directory -Force $p | Out-Null
    Get-ChildItem $p -File -Exclude '.gitignore' -ErrorAction SilentlyContinue | Remove-Item -Force
}
Remove-Item (Join-Path $app 'storage\app\installed.lock') -ErrorAction SilentlyContinue
Remove-Item (Join-Path $app 'bootstrap\cache\*.php') -ErrorAction SilentlyContinue

Write-Host '3/7  Installing production PHP packages (composer --no-dev)...'
Push-Location $app
composer install --no-dev --optimize-autoloader --no-interaction --quiet
Pop-Location

Write-Host '4/7  Copying public files...'
robocopy (Join-Path $root 'public') $web /E /NFL /NDL /NJH /NJS /NP /XD (Join-Path $root 'public\uploads') | Out-Null
New-Item -ItemType Directory -Force (Join-Path $web 'uploads') | Out-Null
Copy-Item (Join-Path $root 'public\uploads\.htaccess') (Join-Path $web 'uploads\.htaccess')
$index = @'
<?php

use Illuminate\Foundation\Application;
use Illuminate\Http\Request;

define('LARAVEL_START', microtime(true));

// The Laravel app lives in ../busestransport (next to public_html).
$base = __DIR__.'/../busestransport';

if (file_exists($maintenance = $base.'/storage/framework/maintenance.php')) {
    require $maintenance;
}

require $base.'/vendor/autoload.php';

/** @var Application $app */
$app = require_once $base.'/bootstrap/app.php';
$app->usePublicPath(__DIR__);

$app->handleRequest(Request::capture());
'@
# UTF-8 *without* BOM — a BOM before <?php would be sent in front of every response.
[System.IO.File]::WriteAllText((Join-Path $web 'index.php'), $index, (New-Object System.Text.UTF8Encoding($false)))

Write-Host '5/7  Writing production .env (fresh keys)...'
$rng = [System.Security.Cryptography.RandomNumberGenerator]::Create()
function RandomBytes([int]$n) { $b = New-Object byte[] $n; $rng.GetBytes($b); return $b }
$appKey = 'base64:' + [Convert]::ToBase64String((RandomBytes 32))
$setupKey = -join ((RandomBytes 12) | ForEach-Object { $_.ToString('x2') })
$chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789'
$adminPass = 'Bt-' + -join ((RandomBytes 14) | ForEach-Object { $chars[$_ % $chars.Length] })
$envText = (Get-Content (Join-Path $root '.env.example') -Raw)
$envText = $envText -replace '(?m)^APP_KEY=.*$', "APP_KEY=$appKey"
$envText = $envText -replace '(?m)^SETUP_KEY=.*$', "SETUP_KEY=$setupKey"
$envText = $envText -replace '(?m)^ADMIN_PASSWORD=.*$', "ADMIN_PASSWORD=""$adminPass"""
[System.IO.File]::WriteAllText((Join-Path $app '.env'), $envText, (New-Object System.Text.UTF8Encoding($false)))

Write-Host '6/7  Exporting the database (fresh content + the admin from this .env)...'
# Needs the local XAMPP MySQL running. The package's own .env supplies ADMIN_EMAIL /
# ADMIN_PASSWORD; process env vars override its (blank) DB settings for this one run.
$mysqlBin = 'C:\xampp\mysql\bin'
$tmpDb = 'bt_package_build'
& "$mysqlBin\mysql.exe" -u root -e "DROP DATABASE IF EXISTS $tmpDb; CREATE DATABASE $tmpDb CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
if ($LASTEXITCODE -ne 0) { throw 'Local MySQL is not running (start XAMPP MySQL first).' }
$dbEnv = @{ DB_CONNECTION = 'mysql'; DB_HOST = '127.0.0.1'; DB_PORT = '3306'; DB_DATABASE = $tmpDb; DB_USERNAME = 'root' }
foreach ($k in $dbEnv.Keys) { Set-Item "Env:$k" $dbEnv[$k] }
Push-Location $app
php artisan migrate --force --seed --no-interaction | Out-Null
$seedOk = $LASTEXITCODE -eq 0
Pop-Location
foreach ($k in $dbEnv.Keys) { Remove-Item "Env:$k" }
if (-not $seedOk) { throw 'Migrating/seeding the export database failed.' }
$sql = Join-Path $build 'busestransport-database.sql'
& "$mysqlBin\mysqldump.exe" -u root --single-transaction --skip-comments --no-tablespaces --default-character-set=utf8mb4 "--result-file=$sql" $tmpDb
& "$mysqlBin\mysql.exe" -u root -e "DROP DATABASE $tmpDb;"
# artisan left runtime files in the package — clear them again
Remove-Item (Join-Path $app 'bootstrap\cache\*.php') -ErrorAction SilentlyContinue
foreach ($d in 'storage\logs', 'storage\framework\cache\data', 'storage\framework\sessions', 'storage\framework\views') {
    Get-ChildItem (Join-Path $app $d) -Recurse -File -Exclude '.gitignore' -ErrorAction SilentlyContinue | Remove-Item -Force
}

Write-Host '7/7  Creating the zip...'
$zip = Join-Path $build 'busestransport-cpanel.zip'
# bsdtar (tar.exe) keeps forward-slash paths, so Linux hosts extract it correctly.
tar.exe -a -cf $zip -C $stage busestransport public_html
$size = [math]::Round((Get-Item $zip).Length / 1MB, 1)
Write-Host ""
Write-Host "Done: $zip ($size MB)"
Write-Host "Database: $sql (import it in phpMyAdmin)"
Write-Host "Open busestransport\.env after upload and fill DB_DATABASE, DB_USERNAME, DB_PASSWORD and APP_URL."
