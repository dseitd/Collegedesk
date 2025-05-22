FROM node:18-alpine as builder

# Установка рабочей директории
WORKDIR /app

# Копирование package.json и package-lock.json
COPY webapp/package*.json ./

# Установка зависимостей
RUN npm install --legacy-peer-deps

# Копирование исходного кода
COPY webapp/ ./

# Сборка приложения
ENV CI=false
RUN npm run build

# Настройка production окружения
FROM nginx:alpine
COPY --from=builder /app/build /usr/share/nginx/html
COPY webapp/nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]