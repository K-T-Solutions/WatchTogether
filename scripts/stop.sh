#!/bin/bash

echo "🛑 Остановка WatchTogether системы..."

# Проверка наличия Docker
if ! command -v docker &> /dev/null; then
    echo "❌ Docker не установлен."
    exit 1
fi

# Проверка наличия Docker Compose
if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose не установлен."
    exit 1
fi

# Остановка контейнеров
echo "⏹️ Остановка контейнеров..."
docker-compose down

echo ""
echo "✅ Система остановлена!"
echo ""
echo "💡 Для полной очистки выполните: docker-compose down -v"
echo "💡 Для удаления образов выполните: docker-compose down --rmi all"
