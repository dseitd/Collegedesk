FROM node:18-alpine as builder

# Установка рабочей директории
WORKDIR /app

# Установка дополнительных зависимостей
RUN apk add --no-cache python3 make g++ git

# Копирование package.json и package-lock.json
COPY webapp/package*.json ./

# Установка зависимостей с дополнительными флагами и проверка версий
RUN node --version && \
    npm --version && \
    npm install -g npm@8.19.4 && \
    npm install --legacy-peer-deps --force

# Копирование исходного кода
COPY webapp/ ./

# Сборка приложения с увеличенным объемом памяти
ENV CI=false
ENV NODE_OPTIONS="--max-old-space-size=8192"
ENV NODE_ENV=production
ENV PATH /app/node_modules/.bin:$PATH
ENV DISABLE_ESLINT_PLUGIN=true
ENV GENERATE_SOURCEMAP=false

# Проверяем скрипты и запускаем сборку с отладочной информацией
RUN ls -la && \
    echo "Starting build..." && \
    CI=false npm run build

# Настройка production окружения
FROM nginx:alpine
COPY --from=builder /app/build /usr/share/nginx/html
COPY webapp/nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]