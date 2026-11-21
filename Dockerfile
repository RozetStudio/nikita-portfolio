# syntax=docker/dockerfile:1

# ---------- deps ----------
FROM node:24-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --no-audit --no-fund

# ---------- build ----------
FROM node:24-alpine AS build
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
# Значения приходят из .env через build args в docker-compose.yml.
# Сайт статический, переменные читаются на этапе сборки.
ARG PUBLIC_SITE_URL=""
ARG TELEGRAM_URL=""
ARG VK_URL=""
ENV PUBLIC_SITE_URL=$PUBLIC_SITE_URL \
    TELEGRAM_URL=$TELEGRAM_URL \
    VK_URL=$VK_URL
RUN npm run build

# ---------- runtime ----------
FROM nginx:1.29-alpine AS runtime
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget -qO- http://127.0.0.1/ >/dev/null 2>&1 || exit 1
CMD ["nginx", "-g", "daemon off;"]
