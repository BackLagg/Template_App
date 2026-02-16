# Многоэтапная сборка для оптимизации размеса образа
FROM node:20-alpine AS builder

# Устанавливаем рабочую директорию
WORKDIR /app

# Копируем файлы зависимостей
COPY package*.json ./

# Устанавливаем зависимости
RUN npm install

# Копируем исходный код
COPY . .

# Собираем приложение
RUN npm run build

# Продакшн образ
FROM node:20-alpine AS production

# Устанавливаем PM2 глобально и wget для health checks
RUN npm install -g pm2 && apk add --no-cache wget

# Создаем пользователя для безопасности
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nestjs -u 1001

# Устанавливаем рабочую директорию
WORKDIR /app

# Копируем package.json и package-lock.json
COPY package*.json ./

# Устанавливаем только продакшн зависимости
RUN npm ci --only=production

# Копируем собранное приложение из builder
COPY --from=builder --chown=nestjs:nodejs /app/dist ./dist

# Создаем папки и устанавливаем права доступа
RUN mkdir -p /app/uploads/voice /app/uploads/temp /app/logs && \
    chown -R nestjs:nodejs /app/uploads && \
    chown -R nestjs:nodejs /app/logs && \
    chmod -R 755 /app/uploads && \
    chmod -R 755 /app/logs

# Переключаемся на пользователя nestjs
USER nestjs

# Открываем порт
EXPOSE 8080

# Запускаем приложение через PM2
CMD ["pm2-runtime", "start", "dist/main.js", "--name", "vera-backend"] 