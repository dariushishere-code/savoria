# SAVORIA Production Audit

**Date:** 2026-09-04
**Status:** 🟡 MOSTLY READY — MANUAL CONFIGURATION REQUIRED

---

## 1. Executive Summary

SAVORIA is a well-structured monorepo with a solid foundation. The core architecture is sound:

- **Frontend:** React + Vite + TanStack Query + React Router
- **Backend:** Fastify + Prisma + PostgreSQL
- **Mobile:** React Native / Expo
- **Monorepo:** pnpm workspaces + Turborepo
- **Database:** Prisma with comprehensive schema

The project builds, lints, typechecks, and tests successfully. The primary gaps are:

1. **No initial Prisma migration** — now created (`20260904000000_init`)
2. **No `migrate:deploy` script** for production — now added
3. **No `production:check` script** — now added
4. **No `.env.production.example`** — now created
5. **Windows-incompatible `clean` script** — now replaced with cross-platform Node.js script
6. **External credentials required** for full production deployment (OpenAI, Resend, R2, Sentry, etc.)

---

## 2. Architecture Verification

### Verified Working

| Component | Status | Notes |
|-----------|--------|-------|
| pnpm workspaces | ✅ | `pnpm-workspace.yaml` valid |
| Turborepo | ✅ | `turbo.json` valid |
| Prisma schema | ✅ | 30+ models, proper relations, indexes |
| Prisma generate | ✅ | `pnpm db:generate` passes |
| Lint | ✅ | `pnpm lint` passes |
| Typecheck | ✅ | `pnpm typecheck` passes |
| Tests | ✅ | `pnpm test` passes |
| Build | ✅ | `pnpm build` passes |
| Docker compose | ✅ | `docker-compose.yml` present |
| GitHub Actions | ✅ | `.github/workflows` present |

### Issues Found & Fixed

| Issue | Severity | Fix |
|-------|----------|-----|
| No initial migration | HIGH | Created `20260904000000_init/migration.sql` |
| No `migrate:deploy` for production | HIGH | Added to `packages/database/package.json` |
| `clean` script used `rm -rf` (Unix-only) | MEDIUM | Replaced with `scripts/clean.mjs` (cross-platform) |
| No `production:check` script | MEDIUM | Added `scripts/production-check.mjs` |
| No `.env.production.example` | MEDIUM | Created with full production guidance |
| No `db:migrate:deploy` root script | MEDIUM | Added to root `package.json` |

---

## 3. Database Schema Review

### Models Present (30+)

- **Auth:** User, Session, EmailVerificationToken, PasswordResetToken
- **Content:** Recipe, RecipeIngredient, RecipeInstruction, RecipeNutrition, RecipeImage, RecipeTag, RecipeDiet
- **Taxonomy:** Cuisine, Country, Category, Tag, Diet, Ingredient
- **User Engagement:** Favorite, Collection, CollectionRecipe, Rating, Comment
- **Planning:** MealPlan, MealPlanItem, ShoppingList, ShoppingListItem
- **AI:** AIConversation, AIMessage, AIUsage
- **Admin:** AuditLog, AdminAction, SiteSetting, FeatureFlag, Report
- **Analytics:** SearchLog

### Schema Quality

- ✅ Proper foreign keys with cascade behavior
- ✅ Unique constraints on slugs, emails, tokens
- ✅ Indexes on frequently-queried fields (status, slug, cuisineId, etc.)
- ✅ Enums for roles, statuses, difficulty, meal types
- ✅ Timestamps on all major models
- ✅ JSONB for flexible metadata

### Recommendations

- Consider adding a `Recipe.searchVector` column with a GIN index for PostgreSQL full-text search (can be added later)
- Consider adding `updatedAt` to `RecipeTag` and `RecipeDiet` join tables if audit trails needed

---

## 4. Authentication & Security Review

### Authentication

- ✅ JWT access + refresh token pattern
- ✅ HttpOnly cookies
- ✅ bcrypt password hashing (12 rounds)
- ✅ Session tracking with refresh token rotation
- ✅ Email verification tokens
- ✅ Password reset tokens
- ✅ Google OAuth support

### RBAC

- ✅ Roles: USER, EDITOR, MODERATOR, ADMIN, SUPER_ADMIN
- ✅ Server-side authorization checks in API routes

### Security Checklist

| Check | Status |
|-------|--------|
| SQL injection protection (Prisma) | ✅ |
| XSS protection (React escaping) | ✅ |
| CSRF (SameSite cookies) | ✅ |
| CORS configuration | ✅ |
| Rate limiting | ✅ |
| Request size limits | ✅ |
| File upload validation | ✅ |
| Secure cookies in production | ✅ |
| No secrets in source | ✅ |
| No stack traces in production | ⚠️ Verify error handler |

---

## 5. Environment Variables

### Required for Production

| Variable | Purpose | Provider |
|----------|---------|----------|
| `DATABASE_URL` | PostgreSQL connection | Neon/Supabase/Railway |
| `DIRECT_URL` | Direct DB connection (pooling) | Neon/Supabase |
| `REDIS_URL` | Redis for rate limiting/caching | Upstash |
| `JWT_ACCESS_SECRET` | Access token signing | Self-generated |
| `JWT_REFRESH_SECRET` | Refresh token signing | Self-generated |
| `COOKIE_SECRET` | Cookie signing | Self-generated |
| `OPENAI_API_KEY` | AI cooking assistant | OpenAI |
| `RESEND_API_KEY` | Transactional email | Resend |
| `S3_*` | Object storage | Cloudflare R2 |
| `SENTRY_DSN` | Error monitoring | Sentry |
| `CAPTCHA_*` | Bot protection | Cloudflare Turnstile |

### Files

- ✅ `.env.example` — development defaults
- ✅ `.env.production.example` — production template (new)

---

## 6. Deployment Architecture

### Recommended Production Stack

```
Frontend:     Vercel (or Cloudflare Pages)
Backend:      Railway (or Render) — Docker container
Database:     Neon (serverless PostgreSQL, Prisma-compatible)
Redis:        Upstash (serverless Redis)
Storage:      Cloudflare R2 (S3-compatible)
Email:        Resend
AI:           OpenAI
Monitoring:   Sentry
```

### Rationale

- **Neon** — Serverless PostgreSQL with connection pooling, Prisma-compatible, generous free tier
- **Upstash** — Serverless Redis, no persistent connection needed, pay-per-use
- **Cloudflare R2** — S3-compatible, no egress fees, cheap storage
- **Railway** — Simple Docker deployment, supports monorepos, automatic HTTPS
- **Vercel** — Best-in-class frontend hosting, edge network, automatic SSL
- **Resend** — Modern email API, simple integration
- **Sentry** — Industry-standard error monitoring

---

## 7. Commands Verified

| Command | Status |
|---------|--------|
| `pnpm install` | ✅ |
| `pnpm db:generate` | ✅ |
| `pnpm lint` | ✅ |
| `pnpm typecheck` | ✅ |
| `pnpm test` | ✅ |
| `pnpm build` | ✅ |
| `pnpm db:migrate` | ⚠️ Requires PostgreSQL |
| `pnpm db:seed` | ⚠️ Requires PostgreSQL |
| `docker compose build` | ⚠️ Requires Docker daemon |

---

## 8. Remaining Manual Actions

### Required for Production

1. **Create a Neon PostgreSQL database** and set `DATABASE_URL` / `DIRECT_URL`
2. **Create an Upstash Redis instance** and set `REDIS_URL`
3. **Create a Cloudflare R2 bucket** and set `S3_*` variables
4. **Get an OpenAI API key** and set `OPENAI_API_KEY`
5. **Get a Resend API key** and set `RESEND_API_KEY`
6. **Create a Sentry project** and set `SENTRY_DSN`
7. **Set up Cloudflare Turnstile** and set `CAPTCHA_*` keys
8. **Generate JWT secrets** with `node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"`
9. **Register domain** (e.g., savoria.app) and configure DNS
10. **Deploy API** to Railway/Render with Docker
11. **Deploy frontend** to Vercel/Cloudflare Pages
12. **Run migrations** with `pnpm db:migrate:deploy`
13. **Run seed** with `pnpm db:seed`

---

## 9. Final Classification

### 🟡 MOSTLY READY — MANUAL CONFIGURATION REQUIRED

The codebase is structurally sound and all automated checks pass. The project is ready for deployment once external services are configured with real credentials. No critical code defects were found that would block production deployment.