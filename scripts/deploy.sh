#!/usr/bin/env bash
# Deploy the website to Cloudflare Workers.
#
#   pnpm ship                 checks + migrations + build + deploy
#   pnpm ship --skip-checks   skip type check, lint and tests (faster)
#
# Steps:
#   1. Confirms you are logged in to Cloudflare (pnpm wrangler login)
#   2. Type check, lint and backup tests (unless --skip-checks)
#   3. If you changed collections/fields, creates a database migration for it
#      (it may ask whether a column was renamed — answer in the terminal)
#   4. Applies any pending migrations to the live D1 database
#   5. Builds with OpenNext and uploads the Worker
set -euo pipefail

cd "$(dirname "$0")/.."

SKIP_CHECKS=0
for arg in "$@"; do
  case "$arg" in
    --skip-checks) SKIP_CHECKS=1 ;;
    -h | --help)
      sed -n '2,15p' "$0" | sed 's/^# \{0,1\}//'
      exit 0
      ;;
    *)
      echo "Unknown option: $arg (try --help)" >&2
      exit 1
      ;;
  esac
done

bold() { printf '\n\033[1;35m▸ %s\033[0m\n' "$1"; }
fail() { printf '\n\033[1;31m✖ %s\033[0m\n' "$1" >&2; exit 1; }
started=$(date +%s)
export CLOUDFLARE_ENV="${CLOUDFLARE_ENV:-}"
# NEXT_PUBLIC_* values are baked in at build time, so set the live domain here.
export NEXT_PUBLIC_SERVER_URL="${NEXT_PUBLIC_SERVER_URL:-https://cccerithparish.co.uk}"

bold "Checking Cloudflare login"
whoami=$(npx wrangler whoami 2>/dev/null || true)
[[ "$whoami" == *"You are logged in"* ]] || fail "Not logged in. Run: pnpm wrangler login"
echo "$whoami" | grep -m1 "You are logged in" || true

if [[ -n "$(git status --porcelain 2>/dev/null)" ]]; then
  echo "Note: you have uncommitted changes — they will be deployed too."
fi

if [[ $SKIP_CHECKS -eq 0 ]]; then
  bold "Type check"
  npx tsc --noEmit || fail "Type errors — fix them or run with --skip-checks"
  bold "Lint"
  pnpm -s lint || fail "Lint errors — fix them or run with --skip-checks"
  bold "Backup tests"
  npx vitest run --config ./vitest.config.mts tests/int/backup.int.spec.ts || fail "Backup tests failed"
fi

bold "Checking for content-structure changes"
before=$(ls src/migrations/*.ts 2>/dev/null | wc -l)
pnpm -s payload migrate:create auto --skip-empty
after=$(ls src/migrations/*.ts 2>/dev/null | wc -l)
if [[ "$after" -gt "$before" ]]; then
  echo "Created a new migration in src/migrations — remember to commit it."
else
  echo "No changes."
fi

bold "Applying database migrations (live D1)"
pnpm run deploy:database

bold "Building and deploying"
pnpm run deploy:app

printf '\n\033[1;32m✔ Deployed in %ss\033[0m\n' "$(( $(date +%s) - started ))"
