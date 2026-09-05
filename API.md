# SAVORIA — API Overview

Base URL (dev): `http://localhost:3001`

Success envelope: `{ "success": true, "data": ..., "message?": "..." }`  
Error envelope: `{ "statusCode": number, "message": string, "code": string, "errors?": {} }`

## Health

| Method | Path | Auth |
|--------|------|------|
| GET | `/health` | — |
| GET | `/health/ready` | — |

## Auth

| Method | Path | Notes |
|--------|------|-------|
| GET | `/api/auth/config` | Captcha / registration flags |
| POST | `/api/auth/register` | + captcha when configured |
| POST | `/api/auth/login` | Sets refresh cookie |
| POST | `/api/auth/logout` | |
| POST | `/api/auth/refresh` | Rotates refresh |
| POST | `/api/auth/forgot-password` | |
| POST | `/api/auth/reset-password` | |
| POST | `/api/auth/verify-email` | |
| POST | `/api/auth/change-password` | JWT |
| GET | `/api/auth/google` | OAuth redirect |
| GET | `/api/auth/sessions` | JWT |
| DELETE | `/api/auth/sessions` | JWT |

Header: `Authorization: Bearer <accessToken>`

## Recipes & search

| Method | Path |
|--------|------|
| GET | `/api/recipes` |
| GET | `/api/recipes/:slug` |
| POST | `/api/recipes` (Editor+) |
| PUT | `/api/recipes/:id` |
| DELETE | `/api/recipes/:id` |
| GET | `/api/search` |
| GET | `/api/search/suggest` |
| GET | `/api/search/facets` |

## Taxonomy

`GET /api/cuisines`, `/countries`, `/categories`, `/tags`, `/diets`, `/ingredients`

## Users

`GET/PATCH /api/users/me`, favorites under `/api/users/me/favorites`

## Admin (`ADMIN`+)

`/api/admin/dashboard`, `/users`, `/recipes`, bulk/import, taxonomy CRUD, settings, feature-flags, audit-logs

## AI

`POST /api/ai/chat` (JWT recommended), conversation list/create under `/api/ai/conversations`

## Meal plans & shopping lists

`/api/meal-plans`, `/api/meal-plans/:id/shopping-list`, `/api/shopping-lists`
