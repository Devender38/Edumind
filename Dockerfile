# ====================================================
# ResolveX Autonomous Agent — Multi-Stage Production Dockerfile
# ====================================================

# ----------------------------------------------------
# Stage 1: Build & Compilation Stage
# ----------------------------------------------------
FROM node:20-alpine AS builder

WORKDIR /app

# Install build dependencies & copy manifests
COPY package.json package-lock.json ./
COPY prisma ./prisma/

# Install all dependencies (including devDependencies for compilation)
RUN npm ci

# Copy source code and configuration manifests
COPY tsconfig.json vite.config.ts index.html ./
COPY src ./src/

# Generate Prisma Client & compile TypeScript backend + Vite frontend
RUN npx prisma generate
RUN npm run build:backend
RUN npm run build:frontend

# ----------------------------------------------------
# Stage 2: Minimal Non-Root Production Runtime
# ----------------------------------------------------
FROM node:20-alpine AS production

ENV NODE_ENV=production
ENV PORT=5000

# Security: Create non-root system group and user
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

WORKDIR /app

# Copy dependency manifests and prisma schema
COPY package.json package-lock.json ./
COPY prisma ./prisma/

# Install production dependencies only
RUN npm ci --only=production
RUN npx prisma generate

# Copy built application artifacts from builder stage
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/dist-backend ./dist-backend

# Ensure runtime directory permissions
RUN chown -R appuser:appgroup /app

# Switch to non-root user
USER appuser

EXPOSE 5000

# Production Container Health Check Probe
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD node -e "require('http').get('http://localhost:5000/api/v1/health', (r) => { process.exit(r.statusCode === 200 ? 0 : 1); }).on('error', () => process.exit(1));"

CMD ["node", "dist-backend/backend/server.js"]
