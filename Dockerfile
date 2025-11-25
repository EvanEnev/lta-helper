ARG CODE_VERSION=22-alpine

# ==========================
# Builder
# ==========================
FROM node:${CODE_VERSION} AS builder
WORKDIR /app

RUN corepack enable && corepack prepare pnpm@latest --activate

# Только зависимости
COPY package.json pnpm-lock.yaml .npmrc ./
RUN pnpm install --frozen-lockfile

# Исходники
COPY . .

# Собираем Next.js
RUN pnpm build


# ==========================
# Runner
# ==========================
FROM node:${CODE_VERSION} AS runner
WORKDIR /app

RUN corepack enable && corepack prepare pnpm@latest --activate

ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1

COPY package.json pnpm-lock.yaml .npmrc ./

RUN pnpm install --frozen-lockfile --prod

COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/lib ./lib
COPY --from=builder /app/server.ts ./server.ts

COPY .env .env.production

CMD ["pnpm", "start"]
