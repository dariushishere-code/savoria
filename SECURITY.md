# SAVORIA — Security

## Overview

SAVORIA is designed with security as a first-class concern. This document describes the security model, controls, and best practices.

---

## Authentication

- **Passwords** — hashed with bcrypt (configurable rounds, default 12)
- **Access tokens** — short-lived JWTs (default 15 minutes)
- **Refresh tokens** — long-lived JWTs (default 7 days) with rotation
- **Cookies** — HttpOnly, SameSite=Lax, Secure in production
- **Session invalidation** — refresh token rotation invalidates old tokens
- **Rate limiting** — on login, register, and refresh endpoints

### Token Storage

- Access tokens: memory (frontend) or HttpOnly cookie
- Refresh tokens: HttpOnly cookie only
- Never store tokens in localStorage (XSS risk)

---

## Authorization (RBAC)

Roles: `USER` → `EDITOR` → `MODERATOR` → `ADMIN` → `SUPER_ADMIN`

- Every protected API route checks authorization **server-side**
- Frontend role checks are for UX only, never for security
- Only `SUPER_ADMIN` can assign `SUPER_ADMIN`
- Users cannot change their own role or status
- Admin mutations are audit-logged

---

## Secrets

- Secrets live only in environment variables
- Never commit secrets to source control
- `.env.example` contains placeholders only
- `.env.production.example` documents production variables
- Dockerfiles never contain secrets
- `docker-compose.yml` uses environment variable interpolation

### Required Secrets

| Variable | Purpose |
|----------|---------|
| `JWT_ACCESS_SECRET` | Sign access tokens (64+ random chars) |
| `JWT_REFRESH_SECRET` | Sign refresh tokens (64+ random chars) |
| `COOKIE_SECRET` | Sign cookies (64+ random chars) |
| `DATABASE_URL` | PostgreSQL connection |
| `REDIS_URL` | Redis connection |
| `OPENAI_API_KEY` | AI provider |
| `RESEND_API_KEY` | Email provider |
| `S3_ACCESS_KEY_ID` | Object storage |
| `S3_SECRET_ACCESS_KEY` | Object storage |

---

## Rate Limiting

- **Global** — all API routes (default 100 req/min)
- **Auth** — login/register/refresh (stricter limits)
- **AI** — per-user daily limits and per-minute rate limits
- **Uploads** — file upload limits

Rate limiting uses Redis when available, in-memory fallback in development.

---

## CORS

- CORS is restricted to configured origins (`WEB_URL`)
- Supports comma-separated multiple origins
- Credentials (cookies) allowed only for configured origins
- Never use `*` with credentials

---

## Cookies

- `HttpOnly` — prevents JavaScript access
- `SameSite=Lax` — CSRF protection
- `Secure` — HTTPS only in production
- `Path=/` — scoped to the API domain
- `Max-Age` — matches token expiration

---

## File Uploads

- MIME type validation (images only: JPEG, PNG, WebP, GIF)
- File size limits (default 5MB)
- Safe filenames (random UUID, no user input)
- Storage abstraction (local dev, S3/R2 production)
- No executable file uploads allowed
- Path traversal protection

---

## Database Security

- Prisma ORM prevents SQL injection
- Parameterized queries only
- Connection pooling for production
- Migrations (not `db:push`) in production
- Least-privilege database user recommended
- Backups configured

---

## AI Security

- API key never exposed to frontend
- Prompt injection resistance (system prompt hardening)
- Usage tracking and daily limits
- Cost protection (max tokens, temperature limits)
- AI responses validated before returning
- AI-generated content clearly distinguishable from database facts

---

## Logging

- Structured JSON logs
- Request ID, timestamp, method, path, status, duration
- **Never log**: passwords, tokens, API keys, database credentials, PII
- Production errors never expose stack traces or internal paths

---

## HTTP Headers

The API uses Helmet for security headers:

- `X-Frame-Options: SAMEORIGIN`
- `X-Content-Type-Options: nosniff`
- `Referrer-Policy: strict-origin-when-cross-origin`
- `X-XSS-Protection: 1; mode=block`
- `Strict-Transport-Security` (HTTPS)

---

## Reporting Vulnerabilities

Report vulnerabilities privately to the project maintainers.

**Do not** file public issues with exploit details until fixed.

Include:

1. Description of the vulnerability
2. Steps to reproduce
3. Impact assessment
4. Suggested fix (if known)

---

## Security Checklist

- [ ] All secrets are strong (64+ random chars)
- [ ] `COOKIE_SECURE=true` in production
- [ ] CORS limited to real domains
- [ ] Rate limiting enabled
- [ ] Helmet enabled
- [ ] No secrets in source code
- [ ] No sensitive data in logs
- [ ] File upload validation enabled
- [ ] AI usage limits configured
- [ ] Admin password rotated
- [ ] Backups configured
- [ ] HTTPS enabled everywhere