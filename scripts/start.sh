#!/usr/bin/env bash
set -e

IMAGE_NAME="kanban-app"
CONTAINER_NAME="kanban-app"
PORT=8000

# رفتن به مسیر ریشه پروژه
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
cd "$PROJECT_ROOT"

echo "بررسی اجرای داکر..."
if ! docker info > /dev/null 2>&1; then
    echo "خطا: داکر در حال اجرا نیست یا در دسترس نمی‌باشد."
    exit 1
fi

# متوقف‌سازی کانتینر قبلی در صورت وجود
if [ "$(docker ps -aq -f name=^/${CONTAINER_NAME}$)" ]; then
    echo "متوقف‌سازی کانتینر قبلی..."
    docker stop "$CONTAINER_NAME" > /dev/null 2>&1 || true
    docker rm "$CONTAINER_NAME" > /dev/null 2>&1 || true
fi

echo "بیلد تصویر داکر ($IMAGE_NAME)..."
docker build -t "$IMAGE_NAME" .

echo "راه‌اندازی کانتینر ($CONTAINER_NAME)..."
ENV_ARG=""
if [ -f "$PROJECT_ROOT/.env" ]; then
    ENV_ARG="--env-file $PROJECT_ROOT/.env"
fi

docker run -d --name "$CONTAINER_NAME" -p "${PORT}:8000" $ENV_ARG "$IMAGE_NAME"

echo "برنامه با موفقیت راه‌اندازی شد:"
echo "آدرس برنامه: http://localhost:$PORT"
echo "آدرس سلامت API: http://localhost:$PORT/api/health"
