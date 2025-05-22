# Stage 1: Build React application
FROM node:18-alpine as webapp-builder

WORKDIR /app/webapp
COPY webapp/ ./

# Установка зависимостей с улучшенной конфигурацией
ENV NODE_OPTIONS="--max-old-space-size=4096"
RUN apk add --no-cache python3 make g++ git && \
    npm cache clean --force && \
    npm config set legacy-peer-deps true && \
    npm install && \
    npm install --save postcss@^8.4.31 postcss-preset-env@^9.3.0 && \
    CI=false SKIP_PREFLIGHT_CHECK=true DISABLE_ESLINT_PLUGIN=true NODE_ENV=production npm run build

# Stage 2: Setup Python for bot and backend
FROM python:3.9-slim as python-base

WORKDIR /app
COPY bot/ /app/bot/
COPY backend/ /app/backend/
COPY --from=webapp-builder /app/webapp/build /app/webapp/build

# Stage 3: Production environment
FROM nginx:stable-alpine

# Copy webapp build
COPY --from=webapp-builder /app/webapp/build /usr/share/nginx/html
COPY webapp/nginx.conf /etc/nginx/conf.d/default.conf

# Install Python and dependencies
RUN apk add --no-cache python3 py3-pip supervisor

# Copy Python environment and install requirements
COPY --from=python-base /app /app
COPY supervisord.conf /etc/supervisor/conf.d/supervisord.conf

# Install Python packages
WORKDIR /app/backend
RUN pip3 install -r requirements.txt
WORKDIR /app/bot
RUN pip3 install -r requirements.txt

# Create data directories and initialize files
RUN mkdir -p /app/backend/data && \
    echo '{"users":[]}' > /app/backend/data/users.json && \
    echo '{"groups":{}}' > /app/backend/data/schedule.json && \
    echo '{"disputes":[]}' > /app/backend/data/disputes.json

EXPOSE 80

CMD ["/usr/bin/supervisord", "-c", "/etc/supervisor/conf.d/supervisord.conf"]