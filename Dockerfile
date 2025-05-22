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
ENV DISABLE_ESLINT_PLUGIN=true
ENV GENERATE_SOURCEMAP=false

# Проверяем скрипты и запускаем сборку
RUN npm install react-scripts --save-dev && \
    npm rebuild node-sass && \
    npm run build

# Настройка production окружения
FROM nginx:alpine
COPY --from=builder /app/build /usr/share/nginx/html
COPY webapp/nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]