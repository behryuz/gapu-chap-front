# --- сборка статики ---
FROM node:24-alpine AS build
WORKDIR /app

# Сначала только манифесты: слой с node_modules пересобирается, лишь когда меняются зависимости.
COPY package.json package-lock.json ./
RUN --mount=type=cache,target=/root/.npm npm ci

COPY . .
RUN npm run build

# --- раздача ---
FROM nginx:1.29-alpine
# Шаблон: при старте образ nginx подставляет переменные окружения через envsubst
# (только заданные — nginx-овские $host, $uri и т. п. не трогаются).
# Значения по умолчанию — для docker-compose; Render задаёт PORT сам, BACKEND_URL — в настройках сервиса.
# NGINX_ENTRYPOINT_LOCAL_RESOLVERS: образ сам берёт DNS из /etc/resolv.conf в NGINX_LOCAL_RESOLVERS.
ENV PORT=80 BACKEND_URL=http://app:8081 NGINX_ENTRYPOINT_LOCAL_RESOLVERS=1
COPY nginx.conf /etc/nginx/templates/default.conf.template
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
