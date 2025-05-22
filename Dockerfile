# Stage 1: Build React application
FROM node:18-alpine as webapp-builder

WORKDIR /app/webapp
COPY webapp/ ./

# Установка зависимостей с правильными флагами
RUN npm config set legacy-peer-deps true && \
    npm config set fetch-retry-maxtimeout 600000 && \
    npm config set fetch-retries 5 && \
    npm config set network-timeout 300000 && \
    npm install --legacy-peer-deps --force && \
    npm install typescript@4.9.5 --save-dev && \
    npm install postcss@^8.4.31 --save && \
    npm run build

# Stage 2: Setup Python for bot and backend
FROM python:3.9-slim as python-base

WORKDIR /app
COPY bot/ /app/bot/
COPY backend/ /app/backend/
COPY --from=webapp-builder /app/webapp/build /app/webapp/build

RUN pip install -r bot/requirements.txt && \
    pip install -r backend/requirements.txt

# Stage 3: Production environment
FROM nginx:stable-alpine

# Copy webapp build
COPY --from=webapp-builder /app/webapp/build /usr/share/nginx/html
COPY webapp/nginx.conf /etc/nginx/conf.d/default.conf

# Copy Python environment
COPY --from=python-base /usr/local/lib/python3.9 /usr/local/lib/python3.9
COPY --from=python-base /usr/local/bin /usr/local/bin
COPY --from=python-base /app /app

# Install supervisor
RUN apk add --no-cache supervisor python3

# Add supervisor configuration
COPY supervisord.conf /etc/supervisor/conf.d/supervisord.conf

EXPOSE 80

CMD ["/usr/bin/supervisord", "-c", "/etc/supervisor/conf.d/supervisord.conf"]