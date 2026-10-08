# syntax=docker/dockerfile:1
# Multi-stage Dockerfile for HEALTHLINK — Clinical OS

# -------------------------------------------------------------
# Stage 1: Builder
# -------------------------------------------------------------
FROM node:20-alpine AS builder

WORKDIR /app

# Install dependencies with frozen lockfile
COPY package.json package-lock.json ./
RUN npm ci

# Copy project source
COPY . .

# Build Vite frontend bundle
RUN npm run build

# -------------------------------------------------------------
# Stage 2: Runner
# -------------------------------------------------------------
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000

# Install production dependencies
COPY package.json package-lock.json ./
RUN npm ci --omit=dev

# Copy built frontend from builder stage
COPY --from=builder /app/dist ./dist

# Copy server source code and config
COPY --from=builder /app/server ./server
COPY --from=builder /app/server.ts ./server.ts
COPY --from=builder /app/src/types ./src/types
COPY --from=builder /app/src/data ./src/data
COPY --from=builder /app/src/context ./src/context

EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000/api/health || exit 1

# Start unified production server
CMD ["tsx", "server.ts"]
