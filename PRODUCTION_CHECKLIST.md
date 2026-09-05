# SAVORIA — Production Checklist

Use this checklist before going live.

---

## Environment

- [ ] Production environment configured
- [ ] `.env.production` created (never committed)
- [ ] All secrets are strong (64+ random chars)
- [ ] No secrets in source code or Dockerfiles

## Database

- [ ] PostgreSQL configured
- [ ] Prisma migrations completed (`pnpm db:migrate`)
- [ ] Seed completed (`pnpm db:seed`)
- [ ] Database backups configured
- [ ] Connection pooling enabled (Neon/Supabase)

## Redis

- [ ] Redis connected
- [ ] `REDIS_URL` set
- [ ] Rate limiting verified

## Storage

- [ ] Object storage configured (Cloudflare R2)
- [ ] `STORAGE_PROVIDER=s3` in production
- [ ] S3 credentials set
- [ ] Public media URL configured

## Email

- [ ] Email configured (Resend)
- [ ] `RESEND_API_KEY` set
- [ ] `EMAIL_FROM` set
- [ ] Domain verified with email provider

## AI

- [ ] AI configured (OpenAI)
- [ ] `OPENAI_API_KEY` set
- [ ] `AI_PROVIDER=openai`
- [ ] AI usage limits configured
- [ ] AI rate limiting verified

## Security

- [ ] CORS configured (limited to real domains)
- [ ] HTTPS enabled
- [ ] Custom domain configured
- [ ] Admin secured (strong password, 2FA if available)
- [ ] Rate limiting enabled
- [ ] Security headers enabled
- [ ] `COOKIE_SECURE=true`
- [ ] JWT secrets rotated
- [ ] No sensitive data in logs

## Monitoring

- [ ] Monitoring enabled (Sentry)
- [ ] `SENTRY_DSN` set
- [ ] Health checks verified
- [ ] Error alerts configured

## Deployment

- [ ] Frontend deployed (Vercel)
- [ ] API deployed (Railway/Render)
- [ ] DNS records configured
- [ ] SSL certificates active
- [ ] Rollback procedure documented

## Functional Testing

- [ ] Authentication tested (register, login, logout, refresh)
- [ ] Authorization tested (RBAC roles)
- [ ] Search tested
- [ ] Recipes tested (browse, view, create, edit)
- [ ] Favorites tested
- [ ] Collections tested
- [ ] Comments tested
- [ ] Ratings tested
- [ ] Meal plans tested
- [ ] Shopping lists tested
- [ ] AI assistant tested
- [ ] Admin dashboard tested
- [ ] PWA tested (installable, offline)
- [ ] Mobile API tested
- [ ] Production build tested

## Performance

- [ ] Core Web Vitals pass
- [ ] Bundle size optimized
- [ ] Image loading optimized
- [ ] Database indexes verified
- [ ] API response times acceptable

## Final

- [ ] `pnpm production:check` passes
- [ ] All CI checks pass
- [ ] Documentation updated
- [ ] Backup/restore tested