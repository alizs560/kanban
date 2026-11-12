# اسکریپت متوقف‌سازی کانتینر در ویندوز (PowerShell)
$ErrorActionPreference = "Continue"

$ContainerName = "kanban-app"

Write-Host "در حال متوقف‌سازی و حذف کانتینر $ContainerName..."

$ExistingContainer = docker ps -a -q -f "name=^/${ContainerName}$"
if ($ExistingContainer) {
    docker stop $ContainerName > $null 2>&1
    docker rm $ContainerName > $null 2>&1
    Write-Host "کانتینر $ContainerName با موفقیت متوقف و حذف شد."
} else {
    Write-Host "کانتینری با نام $ContainerName در حال اجرا یافت نشد."
}
