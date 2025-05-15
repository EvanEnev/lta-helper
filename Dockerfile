# Stage 1: Build stage
FROM node:18-alpine AS builder
WORKDIR /app

ENV NPM_RC="public-hoist-pattern[]=*@heroui/*"

RUN npm install -g pnpm

COPY package.json pnpm-lock.yaml .npmrc ./
RUN pnpm fetch --prod
RUN pnpm install --frozen-lockfile

COPY . .
RUN pnpm build

# Stage 2: Production stage
FROM node:18-alpine AS runner

WORKDIR /app

RUN npm install -g pnpm

COPY --from=builder /app/public ./public
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json

ENV NODE_ENV=production

CMD ["pnpm", "start"]
