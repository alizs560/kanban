# اسکریپت راه‌اندازی کانتینر در ویندوز (PowerShell)
$ErrorActionPreference = "Stop"

$ImageName = "kanban-app"
$ContainerName = "kanban-app"
$Port = 8000

# رفتن به دایرکتوری ریشه پروژه
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$ProjectRoot = Resolve-Path "$ScriptDir\.."
Set-Location $ProjectRoot

Write-Host "بررسی اجرای داکر..."
$null = & docker info 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host "خطا: سرویس داکر در حال اجرا نیست." -ForegroundColor Red
    Write-Host "لطفا برنامه Docker Desktop را باز کنید و پس از آماده شدن آن (سبز شدن آیکون وضعیت)، مجددا این اسکریپت را اجرا کنید." -ForegroundColor Yellow
    exit 1
}

# متوقف‌سازی کانتینر قبلی در صورت وجود
$ExistingContainer = docker ps -a -q -f "name=^/${ContainerName}$"
if ($ExistingContainer) {
    Write-Host "متوقف‌سازی کانتینر قبلی..."
    docker stop $ContainerName > $null 2>&1
    docker rm $ContainerName > $null 2>&1
}

Write-Host "بیلد تصویر داکر ($ImageName)..."
docker build -t $ImageName .

Write-Host "راه‌اندازی کانتینر ($ContainerName)..."
$EnvFileArg = @()
if (Test-Path "$ProjectRoot\.env") {
    $EnvFileArg = @("--env-file", "$ProjectRoot\.env")
}

docker run -d --name $ContainerName -p "${Port}:8000" @EnvFileArg $ImageName

Write-Host "برنامه با موفقیت راه‌اندازی شد:"
Write-Host "آدرس برنامه: http://localhost:$Port"
Write-Host "آدرس سلامت API: http://localhost:$Port/api/health"
