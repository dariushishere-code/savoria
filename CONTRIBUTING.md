# Contributing to SAVORIA

1. Branch from `main` (`feature/...` or `fix/...`).
2. Prefer admin CMS / database changes over hard-coding content.
3. Keep API contracts in `packages/validation` and `packages/types`.
4. Run `pnpm lint && pnpm typecheck && pnpm test` before PR.
5. Do not commit `.env`, secrets, or `node_modules`.

Admin-first rule: recipe and taxonomy data should be editable via Admin APIs without a code deploy.
