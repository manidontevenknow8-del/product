#!/usr/bin/env bash
# Applies all migrations to local Supabase and runs household RLS pgTAP tests.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

if ! command -v docker >/dev/null 2>&1 || ! docker info >/dev/null 2>&1; then
  echo "ERROR: Docker is required. Start Docker Desktop, then re-run:"
  echo "  ./scripts/run-household-rls-tests.sh"
  exit 1
fi

echo "==> Resetting local database (applies all migrations)..."
npx supabase@latest db reset --yes

DB_URL="postgresql://postgres:postgres@127.0.0.1:54322/postgres"

echo "==> Running household RLS tests (pgTAP)..."
psql "$DB_URL" -v ON_ERROR_STOP=1 -f supabase/tests/household_rls_test.sql

echo "==> All household RLS tests passed."
