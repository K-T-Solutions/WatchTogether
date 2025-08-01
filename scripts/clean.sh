#!/bin/bash

echo "🧹 Полная очистка WatchTogether системы..."

# Проверка наличия Docker
if ! command -v docker &> /dev/null; then
    echo "❌ Docker не установлен."
    exit 1
fi

# Подтверждение действия
echo "⚠️ ВНИМАНИЕ: Это действие удалит ВСЕ данные, включая базу данных!"
read -p "Вы уверены, что хотите продолжить? (yes/NO): " confirm
if [[ $confirm != "yes" ]]; then
    echo "❌ Операция отменена."
    exit 0
fi

# Остановка и удаление контейнеров
echo "🛑 Остановка контейнеров..."
docker-compose down

# Удаление томов (данные базы)
echo "🗑️ Удаление томов..."
docker-compose down -v

# Удаление образов
echo "🗑️ Удаление образов..."
docker-compose down --rmi all

# Удаление неиспользуемых ресурсов
echo "🧹 Очистка неиспользуемых ресурсов..."
docker system prune -f

echo ""
echo "✅ Система полностью очищена!"
echo "💡 Для запуска выполните: ./start.sh" 