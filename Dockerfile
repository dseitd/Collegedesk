FROM node:16-alpine as builder

# Установка рабочей директории
WORKDIR /app

# Установка дополнительных зависимостей
RUN apk add --no-cache python3 make g++ git

# Установка стабильной версии npm
RUN npm install -g npm@8.19.4

# Копирование package.json и package-lock.json
COPY webapp/package*.json ./

# Установка зависимостей с оптимальными настройками
RUN npm config set legacy-peer-deps true && \
    npm config set fetch-retry-maxtimeout 600000 && \
    npm config set fetch-retries 5 && \
    npm config set network-timeout 300000 && \
    npm install --no-optional --force

# Копирование исходного кода
COPY webapp/ ./

# Оптимальные настройки среды
ENV CI=false
ENV NODE_OPTIONS="--max-old-space-size=2048"
ENV NODE_ENV=production
ENV PATH /app/node_modules/.bin:$PATH
ENV DISABLE_ESLINT_PLUGIN=true
ENV GENERATE_SOURCEMAP=false

# Сборка приложения с подробным логированием
RUN echo "=== Starting build process ===" && \
    echo "Node $(node -v)" && \
    echo "NPM $(npm -v)" && \
    echo "=== Installing dev dependencies ===" && \
    npm install --only=dev && \
    echo "=== Starting build ===" && \
    npm run build || (echo "=== Build failed! Directory contents: ===" && ls -la && exit 1)

# Настройка production окружения
FROM nginx:stable-alpine
COPY --from=builder /app/build /usr/share/nginx/html
COPY webapp/nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]