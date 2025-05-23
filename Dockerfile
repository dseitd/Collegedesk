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
RUN pip install --no-cache-dir -r requirements.txt

# Анализ и исправление проблем с деплоем на Railway

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

# Устанавливаем Python зависимости и добавляем директорию в PYTHONPATH
ENV PYTHONPATH=/app
RUN pip install --no-cache-dir -r requirements.txt

# Создаем директории для данных и устанавливаем права
RUN mkdir -p /app/backend/data && \
    echo '{"users":{"users":[]}}' > /app/backend/data/users.json && \
    echo '{"schedule":{"groups":{}}}' > /app/backend/data/schedule.json && \
    echo '{"disputes":{"disputes":[]}}' > /app/backend/data/disputes.json && \
    chmod -R 777 /app/backend/data && \
    chown -R www-data:www-data /app/backend/data && \
    chmod -R 644 /app/backend/data/*.json && \
    chmod 755 /app/backend/data

# Настройка прав доступа
RUN chown -R www-data:www-data /app && \
    chmod -R 755 /app

EXPOSE 80

CMD ["/usr/bin/supervisord", "-c", "/etc/supervisor/conf.d/supervisord.conf"]