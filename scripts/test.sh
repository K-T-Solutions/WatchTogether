#!/bin/bash

# ==========================================================
#      Скрипт для разработки и запуска WatchTogether
#   Пересобирает только измененные сервисы и сохраняет данные
# ==========================================================

echo "🚀 Запуск среды разработки WatchTogether..."

# Проверка наличия Docker и Docker Compose
if ! command -v docker &> /dev/null; then
    echo "❌ Docker не найден. Пожалуйста, установите Docker и убедитесь, что он запущен."
    exit 1
fi
if ! command -v docker-compose &> /dev/null && ! docker compose version &> /dev/null; then
    echo "❌ Docker Compose не найден. Пожалуйста, установите его."
    exit 1
fi

# Определение правильной команды compose
if command -v docker-compose &> /dev/null; then
  COMPOSE_CMD="docker-compose"
else
  COMPOSE_CMD="docker compose"
fi

echo "Используется команда: $COMPOSE_CMD"
echo ""

# Запуск системы в фоновом режиме (detached)
# Флаг --build является ключевым: он указывает Docker Compose
# проверить, нужно ли пересобирать какие-либо образы.
echo "🏗️  Запуск системы... Пересборка только измененных сервисов."
$COMPOSE_CMD up -d --build

# Небольшая пауза, чтобы контейнеры успели инициализироваться
echo "⏳ Ожидание инициализации контейнеров..."
sleep 15

# Проверка статуса запущенных сервисов
echo ""
echo "📊 Текущий статус сервисов:"
$COMPOSE_CMD ps
echo ""

echo "✅ Система для разработки успешно запущена!"
echo ""
echo "🌐 Доступные сервисы:"
echo "   API Gateway: http://localhost:4001"
echo "   GraphQL Playground: http://localhost:4001/graphiql"
echo ""
echo "📝 Полезные команды:"
echo "   Просмотр логов: $COMPOSE_CMD logs -f"
echo "   Остановка (сохраняет данные БД): $COMPOSE_CMD down"
echo "   Остановка с удалением данных БД: $COMPOSE_CMD down --volumes"
echo "   Принудительная пересборка всех сервисов: $COMPOSE_CMD build --no-cache && $COMPOSE_CMD up -d"