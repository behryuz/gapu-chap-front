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
# Шаблон: при старте образ nginx подставляет ${PORT} и ${BACKEND_HOST} через envsubst
# (только заданные переменные — nginx-овские $host, $uri и т. п. не трогаются).
# Значения по умолчанию — для docker-compose; Render задаёт PORT сам, BACKEND_HOST — в настройках сервиса.
ENV PORT=80 BACKEND_HOST=app:8081
COPY nginx.conf /etc/nginx/templates/default.conf.template
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
