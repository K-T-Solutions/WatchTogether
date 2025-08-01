#!/bin/bash

echo "🚀 Запуск WatchTogether системы..."

# Проверка наличия Docker
if ! command -v docker &> /dev/null; then
    echo "❌ Docker не установлен. Пожалуйста, установите Docker."
    exit 1
fi

# Проверка наличия Docker Compose
if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose не установлен. Пожалуйста, установите Docker Compose."
    exit 1
fi

# Остановка существующих контейнеров
echo "🛑 Остановка существующих контейнеров..."
docker-compose down

# Удаление старых образов (опционально)
read -p "Удалить старые образы? (y/N): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "🗑️ Удаление старых образов..."
    docker-compose down --rmi all
fi

# Запуск системы
echo "🏗️ Запуск системы..."
docker-compose up -d

# Ожидание запуска сервисов
echo "⏳ Ожидание запуска сервисов..."
sleep 30

# Проверка статуса
echo "📊 Проверка статуса сервисов..."
docker-compose ps

echo ""
echo "✅ Система запущена!"
echo ""
echo "🌐 Доступные сервисы:"
#echo "   Frontend: http://localhost:3000"
echo "   API Gateway: http://localhost:4001"
echo "   GraphQL Playground: http://localhost:4001/graphiql"
echo "   Auth Service"
echo "   User Profile Service"
#echo "   Chat Service: http://localhost:4002"
#echo "   User Profile Service: http://localhost:4003"
#echo "   Notification Service: http://localhost:4004"
#echo "   Social Service: http://localhost:4005"
echo ""
echo "📝 Полезные команды:"
echo "   Просмотр логов: docker-compose logs -f"
echo "   Остановка: docker-compose down"
echo "   Перезапуск: docker-compose restart" 