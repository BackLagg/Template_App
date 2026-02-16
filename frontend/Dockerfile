# Этап сборки React приложения
FROM node:20-alpine AS builder

# Устанавливаем рабочую директорию
WORKDIR /app

# Обновляем npm до последней версии
RUN npm install -g npm@latest

# Копируем файлы зависимостей
COPY package*.json ./

# Очищаем npm кэш и устанавливаем зависимости
RUN npm cache clean --force && \
    npm install

# Копируем исходный код
COPY . .

# Собираем приложение для продакшена
RUN npm run build

# Этап продакшена с Nginx
FROM nginx:alpine AS production

# Устанавливаем wget для health checks
RUN apk add --no-cache wget

# Создаем пользователя для Nginx
RUN addgroup -g 1001 -S nginx-user && \
    adduser -S nginx-user -u 1001

# Копируем собранное приложение
COPY --from=builder --chown=nginx-user:nginx-user /app/dist /usr/share/nginx/html

# Копируем конфигурацию Nginx
COPY nginx.conf /etc/nginx/nginx.conf

# Создаем директории и устанавливаем права
RUN mkdir -p /var/log/nginx /var/cache/nginx && \
    chown -R nginx-user:nginx-user /var/log/nginx && \
    chown -R nginx-user:nginx-user /var/cache/nginx && \
    chown -R nginx-user:nginx-user /etc/nginx/conf.d && \
    chown -R nginx-user:nginx-user /tmp

# Переключаемся на пользователя nginx-user
USER nginx-user

# Открываем порт
EXPOSE 80

# Запускаем Nginx
CMD ["nginx", "-g", "daemon off;"]
