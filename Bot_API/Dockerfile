# Используем официальный Python образ
FROM python:3.11-slim

# Добавляем задержку для избежания rate limit при одновременных запросах
RUN sleep 5

# Устанавливаем рабочую директорию
WORKDIR /app

# Устанавливаем системные зависимости
RUN apt-get update && apt-get install -y \
    gcc \
    && rm -rf /var/lib/apt/lists/*

# Копируем файлы зависимостей
COPY requirements.txt .

# Устанавливаем Python зависимости
RUN pip install --no-cache-dir -r requirements.txt

# Создаем пользователя для безопасности
RUN addgroup --system bot && \
    adduser --system --ingroup bot bot

# Копируем исходный код
COPY . .

# Создаем директорию для логов
RUN mkdir -p /app/logs && \
    chown -R bot:bot /app

# Переключаемся на пользователя bot
USER bot

# Открываем порт (если нужно)
EXPOSE 8000

# Запускаем бота
CMD ["python", "bot.py"] 