# WatchTogether Demo

Микросервисное приложение для совместного просмотра видео с использованием GraphQL API Gateway и gRPC для межсервисного взаимодействия.

## Архитектура

- **API Gateway** (порт 4001) - GraphQL интерфейс для клиентов
- **Auth Service** (порт 8080 HTTP, 9090 gRPC) - Аутентификация и авторизация
- **PostgreSQL** (порт 5432) - База данных
- **Kafka** (порт 9092) - Обмен сообщениями между сервисами

## Быстрый запуск

### Требования
- Docker
- Docker Compose

### Запуск всех сервисов

#### Windows (PowerShell)
```powershell
# Запустить все сервисы
.\start.ps1
```

#### Linux/Mac (Bash)
```bash
# Сделать скрипт исполняемым
chmod +x start.sh

# Запустить все сервисы
./start.sh
```

#### Вручную (любая ОС)
```bash
# Собрать и запустить контейнеры
docker-compose up --build -d

# Проверить статус
docker-compose ps
```

### Остановка

```bash
docker-compose down
```

## Доступные сервисы

После запуска будут доступны:

- **GraphQL Playground**: http://localhost:4001/graphiql
- **Auth Service**: http://localhost:8080
- **PostgreSQL**: localhost:5432
- **Kafka**: localhost:9092

## GraphQL API

### Мутации

#### Регистрация пользователя
```graphql
mutation {
  register(login: "testuser", email: "test@example.com", password: "password123") {
    result
    message
  }
}
```

#### Вход в систему
```graphql
mutation {
  login(username: "testuser", password: "password123") {
    token
    message
  }
}
```

### Запросы

#### Валидация токена
```graphql
query {
  validateToken(token: "your-jwt-token")
}
```

## Логи и отладка

### Просмотр логов
```bash
# Все сервисы
docker-compose logs -f

# Конкретный сервис
docker-compose logs -f api-gateway
docker-compose logs -f auth-service
```

### Подключение к контейнерам
```bash
# API Gateway
docker exec -it watchtogether-api-gateway bash

# Auth Service
docker exec -it watchtogether-auth-service bash

# PostgreSQL
docker exec -it watchtogether-postgres psql -U postgres -d watchtogether
```

## Разработка

### Локальная разработка

Для разработки без Docker:

1. Запустите PostgreSQL и Kafka локально
2. Обновите `application.properties` в сервисах
3. Запустите сервисы через IDE

### Структура проекта

```
WatchTogetherDemo/
├── api-gateway/          # GraphQL API Gateway
├── auth-service/         # Сервис аутентификации
├── chat-service/         # Сервис чата
├── room-service/         # Сервис комнат
├── user-profile-service/ # Сервис профилей
├── docker-compose.yml    # Docker Compose конфигурация
└── start.sh             # Скрипт запуска
```

## Troubleshooting

### Проблемы с подключением к базе данных
```bash
# Проверить статус PostgreSQL
docker-compose logs postgres

# Перезапустить auth-service
docker-compose restart auth-service
```

### Проблемы с gRPC
```bash
# Проверить логи auth-service
docker-compose logs auth-service

# Проверить логи api-gateway
docker-compose logs api-gateway
```

### Очистка данных
```bash
# Удалить все контейнеры и данные
docker-compose down -v

# Удалить образы
docker-compose down --rmi all
```