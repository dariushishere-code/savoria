# SAVORIA — Deployment Guide

This guide explains exactly how to deploy SAVORIA to production.

---

## 1. Required Accounts

| Service | Purpose | URL |
|---------|---------|-----|
| Vercel | Frontend hosting | https://vercel.com |
| Railway or Render | API hosting | https://railway.app / https://render.com |
| Neon or Supabase | PostgreSQL | https://neon.tech / https://supabase.com |
| Upstash | Redis | https://upstash.com |
| Cloudflare R2 | Object storage | https://cloudflare.com |
| Resend | Email | https://resend.com |
| OpenAI | AI provider | https://platform.openai.com |
| Sentry | Monitoring | https://sentry.io |
| Domain registrar | Custom domain | e.g. Namecheap, Cloudflare |

---

## 2. Recommended Architecture

```
Frontend (Vercel)
    ↓ HTTPS
API (Railway/Render)
    ↓
PostgreSQL (Neon/Supabase)
Redis (Upstash)
Object Storage (Cloudflare R2)
Email (Resend)
AI (OpenAI)
Monitoring (Sentry)
```

**Why this stack:**

- **Vercel** — best-in-class for Vite/React SPAs, automatic HTTPS, CDN, and monorepo support.
- **Railway/Render** — simple Docker deployment for the Fastify API, supports persistent volumes and background workers.
- **Neon/Supabase** — managed PostgreSQL with connection pooling, compatible with Prisma.
- **Upstash** — serverless Redis, no infrastructure to manage, ideal for rate limiting and caching.
- **Cloudflare R2** — S3-compatible object storage with zero egress fees.
- **Resend** — simple transactional email API.
- **OpenAI** — the AI provider abstraction supports swapping to other providers.
- **Sentry** — error tracking and performance monitoring.

---

## 3. PostgreSQL Setup

### Option A: Neon

1. Create a project at https://neon.tech
2. Copy the pooled connection string → `DATABASE_URL`
3. Copy the direct connection string → `DIRECT_URL` (for migrations)

### Option B: Supabase

1. Create a project at https://supabase.com
2. Go to Project Settings → Database → Connection string
3. Use the pooler connection string → `DATABASE_URL`
4. Use the direct connection string → `DIRECT_URL`

### Option C: Railway

1. Add a PostgreSQL service in Railway
2. Copy the connection string → `DATABASE_URL`

---

## 4. Redis Setup

### Upstash

1. Create a database at https://upstash.com
2. Copy the `REDIS_URL` (e.g. `rediss://default:...@...upstash.io:6379`)

### Railway

1. Add a Redis service in Railway
2. Copy the connection string → `REDIS_URL`

---

## 5. Storage Setup

### Cloudflare R2

1. Create an R2 bucket (e.g. `savoria-media`)
2. Create an API token with read/write access
3. Set:

```env
STORAGE_PROVIDER=s3
S3_ENDPOINT=https://<account-id>.r2.cloudflarestorage.com
S3_REGION=auto
S3_BUCKET=savoria-media
S3_ACCESS_KEY_ID=<your-access-key>
S3_SECRET_ACCESS_KEY=<your-secret-key>
S3_PUBLIC_URL=https://media.savoria.com
```

### Local (development only)

```env
STORAGE_PROVIDER=local
STORAGE_LOCAL_PATH=./uploads
```

---

## 6. Email Setup

### Resend

1. Create an account at https://resend.com
2. Verify your domain
3. Create an API key → `RESEND_API_KEY`
4. Set `EMAIL_FROM=SAVORIA <noreply@savoria.com>`

---

## 7. AI Setup

### OpenAI

```env
AI_PROVIDER=openai
OPENAI_API_KEY=<your-key>
OPENAI_MODEL=gpt-4o-mini
```

The AI provider abstraction supports swapping to other providers (Anthropic, etc.) by changing `AI_PROVIDER`.

---

## 8. Backend Deployment

### Railway

1. Create a new project → Deploy from GitHub
2. Select the SAVORIA repo
3. Set root directory to `apps/api` (or use the monorepo Dockerfile)
4. Build command: `pnpm install && pnpm db:generate && pnpm --filter @savoria/api build`
5. Start command: `node apps/api/dist/index.js`
6. Add all environment variables (see Section 10)
7. Attach PostgreSQL and Redis services

### Render

1. Create a new Web Service → Deploy from GitHub
2. Select the SAVORIA repo
3. Build command: `pnpm install && pnpm db:generate && pnpm --filter @savoria/api build`
4. Start command: `node apps/api/dist/index.js`
5. Add all environment variables (see Section 10)
6. Attach PostgreSQL and Redis services

---

## 9. Frontend Deployment

### Vercel

1. Import the SAVORIA repo
2. Framework preset: Vite
3. Root directory: `apps/web`
4. Build command: `pnpm install && pnpm --filter @savoria/web build`
5. Output directory: `dist`
6. Add environment variables:

```env
VITE_API_URL=https://api.savoria.com
```

---

## 10. Environment Variables

### Backend (API)

```env
NODE_ENV=production
PORT=3001

# Database
DATABASE_URL=postgresql://...
DIRECT_URL=postgresql://...

# Redis
REDIS_URL=rediss://...

# JWT
JWT_ACCESS_SECRET=<64-char-random>
JWT_REFRESH_SECRET=<64-char-random>
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# Cookies
COOKIE_SECRET=<64-char-random>
COOKIE_SECURE=true

# URLs
WEB_URL=https://savoria.com
API_URL=https://api.savoria.com

# Storage
STORAGE_PROVIDER=s3
S3_ENDPOINT=https://...
S3_REGION=auto
S3_BUCKET=savoria-media
S3_ACCESS_KEY_ID=...
S3_SECRET_ACCESS_KEY=...
S3_PUBLIC_URL=https://media.savoria.com

# Email
RESEND_API_KEY=...
EMAIL_FROM=SAVORIA <noreply@savoria.com>

# AI
AI_PROVIDER=openai
OPENAI_API_KEY=...
OPENAI_MODEL=gpt-4o-mini

# Monitoring
SENTRY_DSN=...
```

### Frontend (Web)

```env
VITE_API_URL=https://api.savoria.com
```

### Mobile (Expo)

```env
EXPO_PUBLIC_API_URL=https://api.savoria.com
```

---

## 11. Database Migration

```bash
# Generate Prisma client
pnpm db:generate

# Apply migrations to production
cd packages/database
npx prisma migrate deploy
```

**Never use `db:push` in production.** Use migrations.

---

## 12. Database Seed

```bash
pnpm db:seed
```

Run once after migrations. This creates cuisines, countries, categories, diets, tags, ingredients, and sample recipes.

---

## 13. CORS

The API reads `WEB_URL` to configure CORS. Set it to your production frontend URL:

```env
WEB_URL=https://savoria.com
```

For multiple origins, the API supports a comma-separated list:

```env
WEB_URL=https://savoria.com,https://www.savoria.com
```

---

## 14. Custom Domain

### Frontend

1. In Vercel → Project → Settings → Domains
2. Add `savoria.com` and `www.savoria.com`
3. Follow Vercel's DNS instructions (CNAME to `cname.vercel-dns.com`)

### API

1. In Railway/Render → Settings → Custom Domain
2. Add `api.savoria.com`
3. Create a CNAME record pointing to your provider's target

### Media

1. In Cloudflare → DNS → Add record
2. CNAME `media` → your R2 bucket endpoint

---

## 15. DNS

| Record | Type | Name | Value |
|--------|------|------|-------|
| Root | A | `@` | Vercel IP (or CNAME to `cname.vercel-dns.com`) |
| WWW | CNAME | `www` | `cname.vercel-dns.com` |
| API | CNAME | `api` | Railway/Render target |
| Media | CNAME | `media` | R2 bucket endpoint |

---

## 16. HTTPS

- **Vercel** — automatic SSL for custom domains
- **Railway/Render** — automatic SSL for custom domains
- **Cloudflare** — free SSL certificates

All HTTPS is automatic. No manual certificate management needed.

---

## 17. Monitoring

### Sentry

1. Create a project at https://sentry.io
2. Copy the DSN → `SENTRY_DSN`
3. The API and web automatically report errors

### Health Checks

```bash
curl https://api.savoria.com/api/health
curl https://api.savoria.com/api/health/db
curl https://api.savoria.com/api/health/redis
```

---

## 18. Production Testing

After deployment, verify:

```bash
# Health
curl https://api.savoria.com/api/health

# Register
curl -X POST https://api.savoria.com/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Test1234!"}'

# Login
curl -X POST https://api.savoria.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Test1234!"}'

# Browse recipes
curl https://api.savoria.com/api/recipes?page=1&limit=10

# Search
curl "https://api.savoria.com/api/search?q=pasta"
```

---

## 19. Rollback Procedure

### Database

```bash
# Check migration history
cd packages/database
npx prisma migrate status

# Roll back to a previous migration
npx prisma migrate resolve --rolled-back <migration-name>
```

### API

1. Railway/Render: Deploy the previous commit
2. Vercel: Use the "Instant Rollback" feature

### Frontend

1. Vercel: Go to Deployments → select previous deployment → Promote to Production

---

## 20. Backup Strategy

- **Neon** — automatic daily backups, point-in-time recovery
- **Supabase** — automatic daily backups (7-day retention on free tier)
- **Railway** — enable volume backups
- **R2** — enable versioning on the bucket

---

## 21. Security Checklist

- [ ] All secrets are strong (64+ random chars)
- [ ] `COOKIE_SECURE=true` in production
- [ ] CORS limited to real domains
- [ ] Rate limiting enabled
- [ ] Captcha enabled (if configured)
- [ ] Admin password rotated
- [ ] No secrets in source code or Dockerfiles
- [ ] HTTPS enabled everywhere
- [ ] Backups configured