# SAVORIA

**Discover. Cook. Savor.**

SAVORIA is a production-grade global recipe discovery platform with an AI cooking assistant, full Admin CMS, meal planner, shopping lists, PWA, and React Native mobile app.

> Tagline: *Discover the world's recipes.*

## Features

- **Recipe discovery** — search, filters (cuisine, country, category, diet, difficulty, time, calories), facets, typeahead
- **Admin CMS** — dashboard, recipe CRUD, bulk import, taxonomy, users, feature flags, audit logs (admin-first; no code changes for content)
- **Authentication** — email/password, JWT + refresh rotation, Turnstile captcha, Google OAuth, session management, RBAC
- **User features** — favorites, collections, ratings, comments
- **AI Chef** — RAG over real recipes in the database, conversation history, usage limits
- **Meal planner** — weekly plan, drag-and-drop style API, auto shopping list
- **Shopping lists** — aggregated from meal plans + manual edits
- **PWA** — installable, offline-friendly caching
- **Mobile** — Expo / React Native shell sharing the same API
- **TWA** — Trusted Web Activity path for Android

## Tech stack

| Layer | Stack |
|-------|--------|
| Monorepo | Turborepo + pnpm |
| API | Node.js, TypeScript, Fastify, Prisma, PostgreSQL, Redis |
| Web | React 18, Vite, Tailwind CSS, TanStack Query, React Router |
| Mobile | Expo, React Native |
| Auth | JWT, bcrypt, cookies, Turnstile, Google OAuth |
| AI | OpenAI-compatible API + RAG over Prisma recipes |
| Infra | Docker Compose, GitHub Actions-ready |

## Monorepo structure

```
savoria/
├── apps/
│   ├── api/          # Fastify backend
│   ├── web/          # React + Vite public site + Admin UI
│   └── mobile/       # Expo React Native
├── packages/
│   ├── database/     # Prisma schema, client, seed
│   ├── types/        # Shared TypeScript types & enums
│   ├── validation/   # Zod schemas
│   ├── config/       # Shared config helpers
│   ├── ui/           # Shared UI primitives
│   ├── tsconfig/     # Base TS configs
│   └── eslint-config/
├── database/prisma/  # Schema & migrations (also under packages/database)
├── docs/
├── infra/
├── scripts/
├── docker-compose.yml
└── .env.example
```

## Prerequisites

- Node.js **≥ 20**
- **pnpm** 9 (`npm i -g pnpm@9`)
- **Docker** (recommended for Postgres + Redis) **or** local PostgreSQL 16
- Optional: Redis, OpenAI API key for AI chat

## Quick start (local)

```bash
# 1. Clone / extract
cd savoria

# 2. Install
pnpm install

# 3. Environment
cp .env.example .env
# Edit .env if needed (defaults work with docker-compose Postgres)

# 4. Start Postgres + Redis
docker compose up -d postgres redis

# 5. Database
pnpm db:setup
# = generate Prisma client + push schema + seed recipes & admin

# 6. Run API + Web
pnpm dev:api    # http://localhost:3001
pnpm dev:web    # http://localhost:5173
```

**Admin login (from seed):**

- Email: `admin@savoria.app` (or `ADMIN_EMAIL` from `.env`)
- Password: value of `ADMIN_PASSWORD` in `.env` (default `ChangeMeAdmin123!`)

Change the admin password after first login in production.

## Development commands

```bash
pnpm dev              # all packages that support dev
pnpm dev:web
pnpm dev:api
pnpm build
pnpm lint
pnpm typecheck
pnpm test
pnpm db:generate
pnpm db:migrate
pnpm db:push
pnpm db:seed
pnpm db:studio
pnpm verify           # lint + typecheck + test + build
pnpm production:check # production readiness checks
```

## Production / Docker

```bash
docker compose up -d --build
# API :3001  Web :5173  Postgres :5432  Redis :6379
```

See **DEPLOYMENT.md** for Vercel, Render, Railway, Neon, Expo EAS, and TWA.

## Environment variables

See **`.env.example`**. Never commit a real `.env`. Required for a minimal local run:

- `DATABASE_URL`
- `JWT_ACCESS_SECRET` / `JWT_REFRESH_SECRET` / `COOKIE_SECRET` (≥ 32 chars each)

Optional: Turnstile, Google OAuth, `OPENAI_API_KEY`, S3, Sentry.

## AI / RAG

1. Set `OPENAI_API_KEY` (or compatible provider).
2. Ensure recipes are seeded (`pnpm db:seed`).
3. Chat endpoints retrieve relevant published recipes and answer only from that context + safe cooking guidance.
4. Usage is tracked per user; free/premium daily limits are configurable.

## Documentation

| Doc | Description |
|-----|-------------|
| [ARCHITECTURE.md](./ARCHITECTURE.md) | System design & data flow |
| [API.md](./API.md) | HTTP API overview |
| [DEPLOYMENT.md](./DEPLOYMENT.md) | Deploy targets |
| [SECURITY.md](./SECURITY.md) | Auth, RBAC, threat model |
| [PRODUCTION_CHECKLIST.md](./PRODUCTION_CHECKLIST.md) | Pre-launch checklist |
| [CONTRIBUTING.md](./CONTRIBUTING.md) | Contribution guidelines |

## License

UNLICENSED — proprietary / private use unless otherwise agreed.
