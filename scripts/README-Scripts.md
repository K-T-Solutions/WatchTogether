# Скрипты управления WatchTogether

Этот документ описывает скрипты для управления системой WatchTogether.

## Доступные скрипты

### Для Linux/macOS (Bash)

- **`start.sh`** - Запуск системы
- **`stop.sh`** - Остановка системы
- **`clean.sh`** - Полная очистка системы

## Использование скриптов

### Linux/macOS

Откройте терминал в папке проекта и выполните:

```bash
# Сделать скрипты исполняемыми (только при первом использовании)
chmod +x *.sh

# Запуск системы
./start.sh

# Остановка системы
./stop.sh

# Полная очистка (удаляет все данные)
./clean.sh
```

## Описание скриптов

### start.sh

**Функции:**
- Проверяет наличие Docker и Docker Compose
- Останавливает существующие контейнеры
- Опционально удаляет старые образы
- Запускает все сервисы
- Показывает статус и доступные URL

**Интерактивные опции:**
- Удаление старых образов (y/N)

### stop.sh

**Функции:**
- Проверяет наличие Docker и Docker Compose
- Останавливает все контейнеры
- Показывает команды для дополнительной очистки

### clean.sh

**Функции:**
- Запрашивает подтверждение действия
- Останавливает контейнеры
- Удаляет тома (данные базы)
- Удаляет образы
- Очищает неиспользуемые ресурсы Docker

**⚠️ ВНИМАНИЕ:** Этот скрипт удаляет ВСЕ данные, включая базу данных!

## Ручные команды

Если скрипты недоступны, используйте команды напрямую:

```bash
# Запуск
docker-compose up -d

# Остановка
docker-compose down

# Остановка с удалением томов
docker-compose down -v

# Остановка с удалением образов
docker-compose down --rmi all

# Просмотр логов
docker-compose logs -f

# Проверка статуса
docker-compose ps

# Перезапуск
docker-compose restart
```

## Troubleshooting

### Проблемы с правами выполнения (Linux/macOS)

```bash
chmod +x *.sh
```

### Проблемы с политикой выполнения (Windows)

Если PowerShell блокирует выполнение скриптов:

```powershell
# Проверить текущую политику
Get-ExecutionPolicy

# Временно разрешить выполнение (только для текущей сессии)
Set-ExecutionPolicy -ExecutionPolicy Bypass -Scope Process

# Или разрешить для текущего пользователя
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

### Проблемы с Docker

```bash
# Проверить статус Docker
docker info

# Перезапустить Docker Desktop (Windows/macOS)
# Или перезапустить службу Docker (Linux)
sudo systemctl restart docker
```

## Автоматизация

### Добавление в PATH (Linux/macOS)

```bash
# Создать символическую ссылку
sudo ln -s $(pwd)/start.sh /usr/local/bin/watchtogether-start
sudo ln -s $(pwd)/stop.sh /usr/local/bin/watchtogether-stop
sudo ln -s $(pwd)/clean.sh /usr/local/bin/watchtogether-clean

# Теперь можно использовать из любой папки
watchtogether-start
watchtogether-stop
watchtogether-clean
```

### Создание алиасов (Linux/macOS)

Добавьте в `~/.bashrc` или `~/.zshrc`:

```bash
alias wt-start='cd /path/to/WatchTogetherDemo && ./start.sh'
alias wt-stop='cd /path/to/WatchTogetherDemo && ./stop.sh'
alias wt-clean='cd /path/to/WatchTogetherDemo && ./clean.sh'
```

### Создание ярлыков (Windows)

Создайте ярлыки на рабочем столе:

1. Правый клик на рабочем столе → Создать → Ярлык
2. В поле "Расположение" введите:
   ```
   powershell.exe -ExecutionPolicy Bypass -File "C:\path\to\WatchTogetherDemo\start.ps1"
   ```
3. Назовите ярлык "WatchTogether Start"
4. Повторите для `stop.ps1` и `clean.ps1` 