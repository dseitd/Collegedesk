FROM node:16-alpine as builder

# Установка рабочей директории
WORKDIR /app

# Установка дополнительных зависимостей
RUN apk add --no-cache python3 make g++ git

# Копирование всего проекта
COPY webapp/ ./

# Установка зависимостей с оптимальными настройками
RUN npm config set legacy-peer-deps true && \
    npm config set fetch-retry-maxtimeout 600000 && \
    npm config set fetch-retries 5 && \
    npm config set network-timeout 300000 && \
    npm install --legacy-peer-deps --force && \
    npm install typescript@4.9.5 --save-dev && \
    npm install react-scripts@5.0.1 --save

# Оптимальные настройки среды
ENV CI=false
ENV NODE_OPTIONS="--max-old-space-size=512"
ENV NODE_ENV=development
ENV PATH /app/node_modules/.bin:$PATH
ENV DISABLE_ESLINT_PLUGIN=true
ENV GENERATE_SOURCEMAP=false

# Сборка приложения
RUN npm audit fix --force && \
    npm run build

# Настройка production окружения
FROM nginx:stable-alpine
COPY --from=builder /app/build /usr/share/nginx/html
COPY webapp/nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]