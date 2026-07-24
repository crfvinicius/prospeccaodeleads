# --- deps (build): todas as dependências, usadas para compilar ---
FROM node:22-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

# --- builder: gera o client do Prisma e o build de produção do Next.js ---
FROM node:22-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

# --- deps-prod: só dependências de produção, para a imagem final ---
FROM node:22-alpine AS deps-prod
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --omit=dev

# --- runner: imagem final que roda o servidor ---
FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=8080

COPY --from=deps-prod /app/node_modules ./node_modules
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/src/generated ./src/generated
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/next.config.ts ./next.config.ts
COPY --from=builder /app/prisma.config.ts ./prisma.config.ts
COPY --from=builder /app/prisma ./prisma

EXPOSE 8080

# Aplica migrações pendentes no banco antes de subir o servidor.
CMD ["sh", "-c", "npx prisma migrate deploy && npm start"]
