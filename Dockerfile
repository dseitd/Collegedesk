FROM node:18-alpine as builder

# Установка рабочей директории
WORKDIR /app

# Установка дополнительных зависимостей
RUN apk add --no-cache python3 make g++

# Копирование package.json и package-lock.json
COPY webapp/package*.json ./

# Установка зависимостей с дополнительными флагами
RUN npm install --legacy-peer-deps --force

# Копирование исходного кода
COPY webapp/ ./

# Сборка приложения с увеличенным объемом памяти
ENV CI=false
ENV NODE_OPTIONS="--max-old-space-size=4096"
ENV NODE_ENV=production
ENV PATH /app/node_modules/.bin:$PATH

# Проверяем скрипты и запускаем сборку
RUN npm run build || (echo "Ошибка сборки. Содержимое package.json:" && \
    cat package.json && \
    echo "\nСодержимое директории:" && \
    ls -la && \
    echo "\nВерсия Node:" && \
    node --version && \
    echo "\nВерсия NPM:" && \
    npm --version && \
    exit 1)

# Настройка production окружения
FROM nginx:alpine
COPY --from=builder /app/build /usr/share/nginx/html
COPY webapp/nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]