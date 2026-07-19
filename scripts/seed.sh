#!/usr/bin/env bash
# ==============================================================================
# Ayushman — Database Seed Script
# ==============================================================================
# Runs Prisma migrations and seeds the database.
# Safe to run multiple times (idempotent).
# ==============================================================================

set -euo pipefail

echo "🌱 Running Ayushman database seed..."

# Check DATABASE_URL is set
if [ -z "${DATABASE_URL:-}" ]; then
  if [ -f ".env" ]; then
    export $(grep -v '^#' .env | grep DATABASE_URL | xargs)
  fi
fi

if [ -z "${DATABASE_URL:-}" ]; then
  echo "❌ DATABASE_URL is not set. Please set it in .env or as an environment variable."
  exit 1
fi

echo "📦 Running migrations..."
pnpm db:migrate:deploy

echo "🌱 Seeding data..."
pnpm db:seed

echo "✅ Database ready."
