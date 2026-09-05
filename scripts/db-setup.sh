#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."
pnpm db:generate
pnpm db:push
pnpm db:seed
echo "Database ready."
