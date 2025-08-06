FROM node:18-alpine AS builder
WORKDIR /app

# Копируем конфигурационные файлы
COPY package*.json ./
COPY postcss.config.js ./
COPY next.config.mjs ./

# Устанавливаем все зависимости (включая dev)
RUN npm install --force

# Копируем исходники
COPY . .

# Собираем приложение
RUN npm run build

FROM node:18-alpine AS runner
WORKDIR /app

# Копируем только необходимые файлы
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public

# Устанавливаем только production зависимости
RUN npm install --force

COPY server.ts ./
COPY lib ./
ENV NODE_ENV=production
COPY .env .env.production

CMD ["npm", "start"]