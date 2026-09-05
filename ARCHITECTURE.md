# SAVORIA — Architecture

## Overview

SAVORIA is a **monorepo** with a clear separation of concerns:

- **apps/api** — Fastify HTTP API, business logic, Prisma access
- **apps/web** — Public React SPA + Admin CMS shell
- **apps/mobile** — Expo client against the same API
- **packages/database** — Prisma schema & client
- **packages/types / validation / config / ui** — shared contracts and UI

## Monorepo Structure

```
savoria/
├── apps/
│   ├── web/          # React SPA (Vite, Tailwind, React Router, TanStack Query)
│   ├── mobile/       # Expo / React Native
│   └── api/          # Fastify API
├── packages/
│   ├── ui/           # Shared React components
│   ├── types/        # Shared TypeScript types
│   ├── validation/   # Zod schemas
│   ├── config/       # Shared config
│   └── database/     # Prisma schema & client
├── database/
│   └── prisma/       # Prisma migrations
├── docs/             # Documentation
├── infra/            # Infrastructure config
├── scripts/          # Build/deploy scripts
├── .github/          # CI/CD
├── docker-compose.yml
├── package.json
├── pnpm-workspace.yaml
└── turbo.json
```

## Request Flow

```
Browser / Mobile
    → REST JSON (Bearer JWT + httpOnly refresh cookie)
    → Fastify plugins (CORS, Helmet, rate limit, JWT)
    → Routes → Services → Prisma → PostgreSQL
```

Admin content changes write to the database; the public site always reads published data from the API (no hard-coded recipe catalogs).

## Frontend (apps/web)

- **Framework**: React 18 + Vite
- **Styling**: Tailwind CSS
- **Routing**: React Router
- **Data fetching**: TanStack Query
- **State**: React Context + hooks
- **PWA**: manifest, service worker, offline fallback
- **SEO**: meta tags, Open Graph, structured data

### Key Routes

| Route | Purpose |
|-------|---------|
| `/` | Home / browse recipes |
| `/recipes` | Recipe listing with search/filter |
| `/recipes/:slug` | Recipe detail |
| `/search` | Search results |
| `/login` / `/register` | Authentication |
| `/admin` | Admin CMS (protected) |
| `/profile` | User profile |
| `/collections` | User collections |
| `/meal-plans` | Meal planning |
| `/shopping-list` | Shopping list |

## Backend (apps/api)

- **Framework**: Fastify
- **Validation**: Zod
- **ORM**: Prisma
- **Auth**: JWT (access + refresh rotation)
- **Rate limiting**: Redis-backed
- **Security**: Helmet, CORS, secure cookies
- **Logging**: Structured JSON with request IDs

### API Areas

```
/auth          — register, login, logout, refresh, OAuth
/users         — profile, settings
/recipes       — CRUD, publish, unpublish
/search        — full-text search, filters, facets
/cuisines      — taxonomy
/countries     — taxonomy
/categories    — taxonomy
/ingredients   — taxonomy
/favorites     — user favorites
/collections   — user collections
/ratings       — recipe ratings
/comments      — recipe comments
/meal-plans    — meal planning
/shopping-list — shopping list
/ai            — AI cooking assistant
/notifications — user notifications
/media         — file uploads
/admin         — admin CMS (RBAC protected)
```

## Database

- **PostgreSQL** via Prisma ORM
- **Models**: users, roles, recipes, ingredients, cuisines, countries, categories, diets, tags, favorites, collections, ratings, comments, cooking history, meal plans, shopping lists, AI conversations/messages/usage, notifications, reports, audit logs, media
- **Migrations**: versioned SQL migrations (not `db:push` in production)
- **Indexes**: on foreign keys, search fields, and frequently queried columns

## Redis

Used for:

- Rate limiting
- Caching
- AI usage limits
- Temporary data

Falls back to in-memory storage in development when Redis is unavailable.

## AI Cooking Assistant

```
User
 ↓
Frontend
 ↓
SAVORIA API
 ↓
Intent Detection
 ↓
Database/Search
 ↓
Relevant Context
 ↓
AI Provider (OpenAI)
 ↓
Validated Response
 ↓
Frontend
```

- Provider abstraction (configurable via `AI_PROVIDER`)
- Daily usage limits per user
- Rate limiting
- Usage tracking
- Prompt injection resistance
- AI-generated content clearly distinguishable from database facts

## Storage

```
StorageProvider
├── LocalStorageProvider (development)
└── S3StorageProvider (production, Cloudflare R2)
```

- Image upload with MIME validation
- File size limits
- Safe filenames (UUID)
- Public URLs for media

## Authentication

1. Login issues short-lived **access JWT** + **refresh token** (DB session)
2. Refresh rotates the session token
3. RBAC roles: `USER` < `EDITOR` < `MODERATOR` < `ADMIN` < `SUPER_ADMIN`
4. Turnstile on register/login/forgot-password when secrets are set
5. Google OAuth find-or-create user path

## Admin CMS

All `/api/admin/*` routes require `ADMIN` or `SUPER_ADMIN`. Mutations write audit logs. Content (recipes, taxonomy) is managed without redeploying code.

### Admin Features

- Dashboard with real database statistics
- User management
- Recipe management (create, edit, publish, unpublish)
- Moderation (reports, comments)
- AI usage monitoring
- Media management
- Settings and feature flags
- Audit logs

## Search

PostgreSQL multi-field filtering + tokenized query matching, facets, suggestions, and `SearchLog` analytics. Service boundary allows swapping in Meilisearch later.

## Deployment

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

See [DEPLOYMENT.md](./DEPLOYMENT.md) for full deployment instructions.

## Data Flow

### Public Recipe Browsing

```
User → Web → GET /api/recipes → API → Prisma → PostgreSQL
                                    ↓
                              Response (JSON)
```

### Recipe Creation (Editor)

```
Editor → Web (Admin) → POST /api/admin/recipes → API → Auth (RBAC)
                                                      ↓
                                                Validation (Zod)
                                                      ↓
                                                Prisma → PostgreSQL
                                                      ↓
                                                Audit Log
```

### AI Assistant

```
User → Web → POST /api/ai/chat → API → Auth → Rate Limit
                                              ↓
                                        Intent Detection
                                              ↓
                                        Search Recipes (DB)
                                              ↓
                                        AI Provider (OpenAI)
                                              ↓
                                        Validate Response
                                              ↓
                                        Store Conversation
                                              ↓
                                        Response to User
```

### File Upload

```
User → Web → POST /api/media → API → Auth → Validate MIME/Size
                                              ↓
                                        StorageProvider
                                              ↓
                                        Local (dev) / S3 (prod)
                                              ↓
                                        Public URL
```

## Monitoring

- **Sentry** — error tracking and performance
- **Health checks** — `/api/health`, `/api/health/db`, `/api/health/redis`
- **Structured logging** — request ID, timestamp, method, path, status, duration