# ─── SAVORIA API Dockerfile ─────────────────────────────────────
# Multi-stage build: deps → build → production
# Uses tsx as the runtime since workspace packages are TypeScript source.

# Stage 1: Dependencies
FROM node:20-alpine AS deps
WORKDIR /app
RUN corepack enable
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml turbo.json ./
COPY packages ./packages
COPY apps/api ./apps/api
COPY database ./database
RUN pnpm install --frozen-lockfile

# Stage 2: Build
FROM deps AS build
RUN pnpm --filter @savoria/database generate
RUN pnpm --filter @savoria/api build

# Stage 3: Production
FROM node:20-alpine AS production
WORKDIR /app
ENV NODE_ENV=production

# Install OpenSSL for Prisma native query engine
RUN apk add --no-cache openssl

# Create non-root user
RUN addgroup -S savoria && adduser -S savoria -G savoria

# Copy built artifacts
COPY --from=build --chown=savoria:savoria /app/package.json ./
COPY --from=build --chown=savoria:savoria /app/pnpm-workspace.yaml ./
COPY --from=build --chown=savoria:savoria /app/turbo.json ./
COPY --from=build --chown=savoria:savoria /app/apps/api ./apps/api
COPY --from=build --chown=savoria:savoria /app/packages ./packages
COPY --from=build --chown=savoria:savoria /app/database ./database
COPY --from=build --chown=savoria:savoria /app/node_modules ./node_modules

# Switch to non-root user
USER savoria

EXPOSE 3001

# Health check
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget -qO- http://127.0.0.1:3001/health || exit 1

# Use tsx to run TypeScript directly (workspace packages are TS source)
# tsx is available in the pnpm store from the deps stage
CMD ["node_modules/.pnpm/node_modules/.bin/tsx", "apps/api/src/index.ts"]
