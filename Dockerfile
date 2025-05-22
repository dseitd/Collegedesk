FROM node:16-alpine as builder

# Установка рабочей директории
WORKDIR /app

# Установка дополнительных зависимостей
RUN apk add --no-cache python3 make g++ git

# Копирование package.json и package-lock.json
COPY webapp/package*.json ./

# Установка зависимостей с оптимальными настройками
RUN npm config set legacy-peer-deps true && \
    npm config set fetch-retry-maxtimeout 600000 && \
    npm config set fetch-retries 5 && \
    npm config set network-timeout 300000 && \
    npm install --legacy-peer-deps --production=false && \
    npm install react-scripts -g

# Копирование исходного кода
COPY webapp/ ./

# Оптимальные настройки среды
ENV CI=false
ENV NODE_OPTIONS="--max-old-space-size=1024"
ENV NODE_ENV=development
ENV PATH /app/node_modules/.bin:$PATH
ENV DISABLE_ESLINT_PLUGIN=true
ENV GENERATE_SOURCEMAP=false

# Сборка приложения
RUN CI=false NODE_ENV=development npm run build

# Настройка production окружения
FROM nginx:stable-alpine
COPY --from=builder /app/build /usr/share/nginx/html
COPY webapp/nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]