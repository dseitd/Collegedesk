# Stage 1: Build React application
FROM node:18-alpine as webapp-builder

WORKDIR /app/webapp
COPY webapp/ ./

# Установка зависимостей с улучшенной конфигурацией
ENV NODE_OPTIONS="--max-old-space-size=4096"
RUN apk add --no-cache python3 make g++ git && \
    npm cache clean --force && \
    npm config set legacy-peer-deps true && \
    npm ci && \
    npm audit fix --force || true && \
    CI=false SKIP_PREFLIGHT_CHECK=true DISABLE_ESLINT_PLUGIN=true NODE_ENV=production npm run build

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
RUN apk add --no-cache supervisor python3 py3-pip

# Add supervisor configuration
COPY supervisord.conf /etc/supervisor/conf.d/supervisord.conf

EXPOSE 80

CMD ["/usr/bin/supervisord", "-c", "/etc/supervisor/conf.d/supervisord.conf"]