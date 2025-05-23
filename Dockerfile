# Stage 1: Build React application
FROM node:18-alpine as webapp-builder

WORKDIR /app/webapp
COPY webapp/ ./

# Установка зависимостей с улучшенной конфигурацией
ENV NODE_OPTIONS="--max-old-space-size=4096"
RUN apk add --no-cache python3 make g++ git && \
    npm cache clean --force && \
    npm config set legacy-peer-deps true && \
    npm install && \
    npm install --save ajv@^8.12.0 ajv-keywords@^5.1.0 postcss@^8.4.31 postcss-preset-env@^9.3.0 && \
    CI=false SKIP_PREFLIGHT_CHECK=true DISABLE_ESLINT_PLUGIN=true NODE_ENV=production npm run build

# Stage 2: Production environment
FROM python:3.9-slim

# Установка системных зависимостей
RUN apt-get update && apt-get install -y \
    nginx \
    supervisor \
    git \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

# Копируем файлы приложения
WORKDIR /app
COPY requirements.txt /app/
COPY bot/ /app/bot/
COPY backend/ /app/backend/
COPY supervisord.conf /etc/supervisor/conf.d/supervisord.conf
COPY webapp/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=webapp-builder /app/webapp/build /usr/share/nginx/html

# Устанавливаем Python зависимости
ENV PYTHONPATH=/app \
    PYTHONUNBUFFERED=1
RUN pip install --no-cache-dir -r requirements.txt

# Создаем необходимые директории и файлы
RUN mkdir -p /app/backend/data /var/log/nginx /var/cache/nginx && \
    chown -R www-data:www-data /var/log/nginx /var/cache/nginx && \
    chmod -R 755 /var/log/nginx /var/cache/nginx

# Инициализация файлов данных
RUN for file in users.json schedule.json disputes.json attendance.json grades.json news.json; do \
        echo '{"data":[]}' > "/app/backend/data/$file"; \
    done && \
    chown -R www-data:www-data /app/backend/data && \
    chmod -R 777 /app/backend/data && \
    chmod 666 /app/backend/data/*.json

# Настройка прав доступа
RUN chown -R www-data:www-data /app && \
    chmod -R 755 /app && \
    chown -R www-data:www-data /usr/share/nginx/html && \
    chmod -R 755 /usr/share/nginx/html

EXPOSE 80

CMD ["/usr/bin/supervisord", "-c", "/etc/supervisor/conf.d/supervisord.conf"]