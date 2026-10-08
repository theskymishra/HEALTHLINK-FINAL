# syntax=docker/dockerfile:1

FROM node:20-alpine AS builder

WORKDIR /app

COPY package.json package-lock.json ./

RUN npm ci

COPY . .

RUN npm run build


FROM node:20-alpine AS runner

WORKDIR /app

ENV PORT=3000

COPY package.json package-lock.json ./

RUN npm ci

ENV NODE_ENV=production

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/server ./server
COPY --from=builder /app/server.ts ./server.ts
COPY --from=builder /app/src/types ./src/types
COPY --from=builder /app/src/data ./src/data
COPY --from=builder /app/src/context ./src/context

EXPOSE 3000

HEALTHCHECK \
  --interval=30s \
  --timeout=5s \
  --start-period=10s \
  --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000/api/health || exit 1

CMD ["./node_modules/.bin/tsx", "server.ts"]
