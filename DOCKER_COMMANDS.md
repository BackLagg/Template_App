# Команды для работы с Docker сервисами

## Проверка статуса сервисов

### Статус всех контейнеров

```bash
# Список всех контейнеров и их статус
docker-compose ps

# Детальная информация о контейнерах
docker ps -a

# Только запущенные контейнеры
docker ps

# Статус конкретного сервиса
docker-compose ps backend
docker-compose ps payment-service
docker-compose ps integration-api-service
```

### Проверка здоровья сервисов

```bash
# Healthcheck всех сервисов
docker-compose ps --format json | jq '.[] | {name: .Name, status: .State, health: .Health}'

# Проверка конкретного сервиса
docker inspect fabricbot-backend --format='{{.State.Health.Status}}'
docker inspect payment-service --format='{{.State.Health.Status}}'
docker inspect integration-api-service --format='{{.State.Health.Status}}'
```

### Статистика использования ресурсов

```bash
# Использование ресурсов всеми контейнерами
docker stats

# Статистика конкретного контейнера
docker stats fabricbot-backend --no-stream
docker stats payment-service --no-stream
docker stats integration-api-service --no-stream
```

## Просмотр логов

### Backend (fabricbot-backend)

```bash
# Последние 30 строк
docker logs --tail=30 fabricbot-backend

# Последние 100 строк
docker logs --tail=100 fabricbot-backend

# Логи в реальном времени (follow)
docker logs -f fabricbot-backend

# Логи с временными метками
docker logs -t --tail=30 fabricbot-backend

# Логи за последний час
docker logs --since 1h fabricbot-backend

# Логи за последние 10 минут
docker logs --since 10m fabricbot-backend

# Через docker-compose
docker-compose logs --tail=30 backend
docker-compose logs -f backend
docker-compose logs --since 10m backend
```

### Payment Service (payment-service)

```bash
# Последние 30 строк
docker logs --tail=30 payment-service

# Логи в реальном времени
docker logs -f payment-service

# Логи с временными метками
docker logs -t --tail=30 payment-service

# Через docker-compose
docker-compose logs --tail=30 payment-service
docker-compose logs -f payment-service
```

### Integration API Service (integration-api-service)

```bash
# Последние 30 строк
docker logs --tail=30 integration-api-service

# Логи в реальном времени
docker logs -f integration-api-service

# Логи с временными метками
docker logs -t --tail=30 integration-api-service

# Через docker-compose
docker-compose logs --tail=30 integration-api-service
docker-compose logs -f integration-api-service
```

### Frontend (fabricbot-frontend)

```bash
# Последние 30 строк
docker logs --tail=30 fabricbot-frontend

# Логи в реальном времени
docker logs -f fabricbot-frontend

# Через docker-compose
docker-compose logs --tail=30 frontend
docker-compose logs -f frontend
```

### Docs Frontend (fabricbot-docs-frontend)

```bash
# Последние 30 строк
docker logs --tail=30 fabricbot-docs-frontend

# Логи в реальном времени
docker logs -f fabricbot-docs-frontend

# Через docker-compose
docker-compose logs --tail=30 docs-frontend
docker-compose logs -f docs-frontend
```

### Bot (fabricbot-bot)

```bash
# Последние 30 строк
docker logs --tail=30 fabricbot-bot

# Логи в реальном времени
docker logs -f fabricbot-bot

# Через docker-compose
docker-compose logs --tail=30 bot
docker-compose logs -f bot
```

### Nginx (fabricbot-nginx)

```bash
# Последние 30 строк
docker logs --tail=30 fabricbot-nginx

# Логи в реальном времени
docker logs -f fabricbot-nginx

# Через docker-compose
docker-compose logs --tail=30 nginx
docker-compose logs -f nginx

# Логи доступа и ошибок (из volumes)
tail -f ./logs/nginx/access.log
tail -f ./logs/nginx/error.log
```

### Grafana (fabricbot-grafana)

```bash
# Последние 30 строк
docker logs --tail=30 fabricbot-grafana

# Логи в реальном времени
docker logs -f fabricbot-grafana

# Через docker-compose
docker-compose logs --tail=30 grafana
docker-compose logs -f grafana
```

### Prometheus (fabricbot-prometheus)

```bash
# Последние 30 строк
docker logs --tail=30 fabricbot-prometheus

# Логи в реальном времени
docker logs -f fabricbot-prometheus

# Через docker-compose
docker-compose logs --tail=30 prometheus
docker-compose logs -f prometheus
```

### Redis (Payment Service) - payment-redis

```bash
# Последние 30 строк
docker logs --tail=30 payment-redis

# Логи в реальном времени
docker logs -f payment-redis

# Через docker-compose
docker-compose logs --tail=30 payment-redis
docker-compose logs -f payment-redis
```

### Redis (Backend) - backend-redis

```bash
# Последние 30 строк
docker logs --tail=30 backend-redis

# Логи в реальном времени
docker logs -f backend-redis

# Через docker-compose
docker-compose logs --tail=30 backend-redis
docker-compose logs -f backend-redis
```

### Node Exporter (fabricbot-node-exporter)

```bash
# Последние 30 строк
docker logs --tail=30 fabricbot-node-exporter

# Логи в реальном времени
docker logs -f fabricbot-node-exporter
```

### cAdvisor (fabricbot-cadvisor)

```bash
# Последние 30 строк
docker logs --tail=30 fabricbot-cadvisor

# Логи в реальном времени
docker logs -f fabricbot-cadvisor
```

## Полезные команды

### Просмотр логов всех сервисов

```bash
# Все контейнеры (последние 30 строк)
docker-compose logs --tail=30

# Несколько сервисов одновременно
docker-compose logs --tail=30 backend payment-service integration-api-service

# Логи в реальном времени для нескольких сервисов
docker-compose logs -f backend payment-service integration-api-service

# Все сервисы в реальном времени
docker-compose logs -f
```

### Поиск в логах

```bash
# Поиск ошибок в логах backend
docker logs fabricbot-backend 2>&1 | grep -i error

# Поиск по времени
docker logs fabricbot-backend --since "2025-01-21T19:00:00" --until "2025-01-21T20:00:00"

# Поиск с контекстом (5 строк до и после)
docker logs fabricbot-backend 2>&1 | grep -i error -A 5 -B 5

# Поиск в логах всех сервисов
docker-compose logs | grep -i error

# Поиск по конкретному тексту
docker logs fabricbot-backend 2>&1 | grep "payment"
docker logs payment-service 2>&1 | grep "transaction"
```

### Фильтрация логов

```bash
# Только ошибки (PowerShell)
docker logs fabricbot-backend 2>&1 | Select-String -Pattern "error" -CaseSensitive:$false

# Только предупреждения
docker logs fabricbot-backend 2>&1 | Select-String -Pattern "warn" -CaseSensitive:$false

# Логи за определенный период
docker logs fabricbot-backend --since 2h --until 1h
```

### Экспорт логов

```bash
# Сохранить логи в файл
docker logs fabricbot-backend > backend-logs.txt

# Сохранить логи с временными метками
docker logs -t fabricbot-backend > backend-logs-with-timestamps.txt

# Экспорт логов нескольких сервисов
docker-compose logs backend payment-service > services-logs.txt

# Экспорт с фильтрацией
docker logs fabricbot-backend 2>&1 | grep -i error > backend-errors.txt
```

### Очистка логов

```bash
# Очистить логи контейнера (требует перезапуска)
docker-compose restart backend

# Очистить все логи (удалить контейнер и создать заново)
docker-compose down
docker-compose up -d
```

## Управление сервисами

### Запуск и остановка

```bash
# Запустить все сервисы
docker-compose up -d

# Запустить конкретный сервис
docker-compose up -d backend
docker-compose up -d payment-service
docker-compose up -d integration-api-service

# Остановить все сервисы
docker-compose down

# Остановить конкретный сервис
docker-compose stop backend
docker-compose stop payment-service

# Перезапустить сервис
docker-compose restart backend
docker-compose restart payment-service
```

### Пересборка и обновление

```bash
# Пересобрать и перезапустить конкретный сервис
docker-compose up -d --build backend

# Пересобрать все сервисы
docker-compose up -d --build

# Пересобрать без кэша
docker-compose build --no-cache backend
docker-compose up -d --build backend
```

### Вход в контейнер

```bash
# Войти в контейнер backend
docker exec -it fabricbot-backend sh

# Войти в контейнер payment-service
docker exec -it payment-service sh

# Войти в контейнер integration-api-service
docker exec -it integration-api-service sh

# Выполнить команду в контейнере
docker exec fabricbot-backend ls -la /app
docker exec payment-service node --version
```

## Мониторинг и диагностика

### Проверка сетевых подключений

```bash
# Список сетей
docker network ls

# Информация о сети
docker network inspect fabricbot-network

# Проверка подключения между контейнерами
docker exec fabricbot-backend ping payment-service
docker exec payment-service ping integration-api-service
```

### Проверка портов

```bash
# Какие порты открыты
docker-compose ps

# Проверка доступности порта
Test-NetConnection -ComputerName localhost -Port 8080
Test-NetConnection -ComputerName localhost -Port 3001
Test-NetConnection -ComputerName localhost -Port 3005
```

### Проверка volumes

```bash
# Список volumes
docker volume ls

# Информация о volume
docker volume inspect payment_redis_data
docker volume inspect backend_redis_data

# Размер volumes
docker system df -v
```

### Проверка использования диска

```bash
# Использование диска Docker
docker system df

# Детальная информация
docker system df -v

# Очистка неиспользуемых ресурсов
docker system prune -a
```

## Быстрые команды (самые используемые)

### Основные сервисы

```bash
# Backend - логи в реальном времени
docker logs -f fabricbot-backend

# Payment Service - логи в реальном времени
docker logs -f payment-service

# Integration API Service - логи в реальном времени
docker logs -f integration-api-service

# Все три основных сервиса одновременно
docker-compose logs -f backend payment-service integration-api-service
```

### Проверка статуса

```bash
# Статус всех контейнеров
docker-compose ps

# Статус PM2 процессов (File Service)
pm2 status

# Healthcheck скрипт
bash scripts/healthcheck.sh
```

### Последние ошибки

```bash
# Последние ошибки в backend
docker logs fabricbot-backend --tail=100 2>&1 | Select-String -Pattern "error" -CaseSensitive:$false

# Последние ошибки в payment-service
docker logs payment-service --tail=100 2>&1 | Select-String -Pattern "error" -CaseSensitive:$false

# Последние ошибки в integration-api-service
docker logs integration-api-service --tail=100 2>&1 | Select-String -Pattern "error" -CaseSensitive:$false
```

## PM2 сервисы (File Service)

### Просмотр логов

```bash
# Последние 100 строк
pm2 logs file-service --lines 100

# Логи в реальном времени
pm2 logs file-service

# Только ошибки
pm2 logs file-service --err

# Только стандартный вывод
pm2 logs file-service --out

# Логи из файла
tail -f ./logs/file-service/*.log
```

### Управление

```bash
# Статус
pm2 status file-service

# Перезапуск
pm2 restart file-service

# Остановка
pm2 stop file-service

# Очистка логов
pm2 flush file-service
```

## Полезные скрипты

### Healthcheck всех сервисов

```bash
bash scripts/healthcheck.sh
```

### Проверка доступности API

```bash
# Backend health
curl http://localhost:8080/api/health

# Payment Service health
curl http://localhost:3001/api/v1/payment/health

# Integration API Service metrics
curl http://localhost:3005/metrics
```

## Troubleshooting

### Если сервис не запускается

```bash
# Проверить логи
docker logs fabricbot-backend

# Проверить статус
docker-compose ps backend

# Проверить конфигурацию
docker-compose config

# Пересобрать сервис
docker-compose up -d --build --force-recreate backend
```

### Если сервис падает

```bash
# Последние логи перед падением
docker logs fabricbot-backend --tail=200

# Проверить использование ресурсов
docker stats fabricbot-backend --no-stream

# Проверить healthcheck
docker inspect fabricbot-backend --format='{{.State.Health}}'
```

### Очистка и перезапуск

```bash
# Остановить все
docker-compose down

# Удалить volumes (ОСТОРОЖНО - удалит данные!)
docker-compose down -v

# Пересобрать и запустить
docker-compose up -d --build
```
