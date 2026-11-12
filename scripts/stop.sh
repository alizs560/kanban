#!/usr/bin/env bash

CONTAINER_NAME="kanban-app"

echo "در حال متوقف‌سازی و حذف کانتینر $CONTAINER_NAME..."

if [ "$(docker ps -aq -f name=^/${CONTAINER_NAME}$)" ]; then
    docker stop "$CONTAINER_NAME" > /dev/null 2>&1 || true
    docker rm "$CONTAINER_NAME" > /dev/null 2>&1 || true
    echo "کانتینر $CONTAINER_NAME با موفقیت متوقف و حذف شد."
else
    echo "کانتینری با نام $CONTAINER_NAME یافت نشد."
fi
