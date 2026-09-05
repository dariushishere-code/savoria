# ─── SAVORIA Web Dockerfile ─────────────────────────────────────
# Multi-stage build: deps → build → nginx

# Stage 1: Dependencies
FROM node:20-alpine AS deps
WORKDIR /app
RUN corepack enable
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml turbo.json ./
COPY packages ./packages
COPY apps/web ./apps/web
RUN pnpm install --frozen-lockfile

# Stage 2: Build
FROM deps AS build
RUN pnpm --filter @savoria/web build

# Stage 3: Nginx
FROM nginx:alpine
COPY --from=build /app/apps/web/dist /usr/share/nginx/html

# SPA routing config — fallback to index.html for client-side routes
COPY apps/web/nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

# Health check
HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
  CMD wget -qO- http://127.0.0.1/ || exit 1

CMD ["nginx", "-g", "daemon off;"]