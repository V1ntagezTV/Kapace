# Этап сборки
FROM node:20-alpine as build-stage

WORKDIR /app

# Копируем зависимости и устанавливаем их
COPY package*.json ./
RUN npm install

# Копируем исходный код
COPY . .

# Собираем проект
RUN npm run build -- --mode production

# Этап запуска
FROM nginx:stable-alpine as production-stage

# Копируем собранные файлы из этапа сборки
COPY --from=build-stage /app/dist /usr/share/nginx/html

# Конфигурация nginx для SPA (для Vue Router history mode)
COPY nginx.conf /etc/nginx/conf.d/default.conf

# установку Certbot
RUN RUN apk add --no-cache certbot

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]