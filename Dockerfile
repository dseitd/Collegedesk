FROM node:18-alpine as builder

# Установка рабочей директории
WORKDIR /app

# Копирование package.json и package-lock.json
COPY webapp/package*.json ./

# Установка зависимостей с дополнительными флагами
RUN npm install --legacy-peer-deps --force

# Копирование исходного кода
COPY webapp/ ./

# Сборка приложения с увеличенным объемом памяти
ENV CI=false
ENV NODE_OPTIONS="--max-old-space-size=4096"
RUN npm run build

# Настройка production окружения
FROM nginx:alpine
COPY --from=builder /app/build /usr/share/nginx/html
COPY webapp/nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]