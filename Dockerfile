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
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
