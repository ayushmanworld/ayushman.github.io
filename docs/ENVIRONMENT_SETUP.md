# Environment Setup Guide

## Overview

This guide walks through setting up the Ayushman development environment from scratch on macOS, Linux, or Windows (WSL2).

---

## 1. System Prerequisites

### macOS

```bash
# Install Homebrew (if not installed)
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# Install Node.js 20 via nvm
brew install nvm
echo 'export NVM_DIR="$HOME/.nvm"' >> ~/.zshrc
echo '[ -s "$HOME/.nvm/nvm.sh" ] && \. "$HOME/.nvm/nvm.sh"' >> ~/.zshrc
source ~/.zshrc
nvm install 20
nvm use 20

# Install pnpm
corepack enable
corepack prepare pnpm@9.4.0 --activate

# Install Docker Desktop
brew install --cask docker
```

### Ubuntu / Debian

```bash
# Node.js 20 via NodeSource
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# pnpm
corepack enable
corepack prepare pnpm@9.4.0 --activate

# Docker
sudo apt-get install -y docker.io docker-compose-v2
sudo usermod -aG docker $USER
newgrp docker
```

### Windows (WSL2)

Install WSL2 with Ubuntu 22.04, then follow the Ubuntu instructions above.

---

## 2. Clone & Setup

```bash
git clone https://github.com/ayushman-ngo/ayushman.git
cd ayushman

# Automated setup (recommended)
bash scripts/setup.sh
```

The setup script:
1. Verifies Node.js ≥ 20 and pnpm ≥ 9
2. Creates `.env` from `.env.example`
3. Installs all dependencies (`pnpm install`)
4. Installs Husky Git hooks
5. Starts Docker services
6. Builds shared packages
7. Runs Prisma migrations
8. Seeds the database

---

## 3. Manual Setup (if setup.sh fails)

```bash
# Install dependencies
pnpm install --frozen-lockfile

# Copy environment file
cp .env.example .env

# Install Husky hooks
pnpm prepare

# Start Docker services
docker compose up -d

# Wait ~30 seconds for PostgreSQL to initialise, then:
pnpm db:migrate
pnpm db:seed

# Build shared packages
pnpm turbo run build \
  --filter=@ayushman/types \
  --filter=@ayushman/config \
  --filter=@ayushman/utils \
  --filter=@ayushman/ui
```

---

## 4. Environment Variables

### Minimum Required (local development)

Edit `.env` and set at minimum:

```bash
# Already correct if using Docker Compose defaults:
DATABASE_URL=postgresql://ayushman:ayushman_dev_secret@localhost:5432/ayushman_dev
REDIS_URL=redis://localhost:6379
MEILISEARCH_HOST=http://localhost:7700
MEILISEARCH_MASTER_KEY=ayushman_meili_dev_master_key

# Generate random secrets (must be ≥ 32 chars each):
JWT_ACCESS_SECRET=your-random-access-secret-at-least-32-chars
JWT_REFRESH_SECRET=your-random-refresh-secret-at-least-32-chars

# Frontend URLs (already correct for local dev):
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_API_URL=http://localhost:4000
```

### Optional (feature-specific)

| Variable | Feature | Where to get it |
|---|---|---|
| `ANTHROPIC_API_KEY` | AI Assistant | https://console.anthropic.com |
| `OPENAI_API_KEY` | Embeddings | https://platform.openai.com |
| `RAZORPAY_KEY_ID` + `SECRET` | Donations | https://dashboard.razorpay.com |
| `RESEND_API_KEY` | Email | https://resend.com |
| `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` | Maps | https://console.cloud.google.com |
| `SENTRY_DSN` | Error monitoring | https://sentry.io |
| `NEXT_PUBLIC_POSTHOG_KEY` | Analytics | https://posthog.com |

---

## 5. Docker Services

The `docker-compose.yml` starts these services:

| Service | URL | Purpose |
|---|---|---|
| PostgreSQL 16 + pgvector | `localhost:5432` | Primary database |
| Redis 7 | `localhost:6379` | Cache + queues |
| Meilisearch | `localhost:7700` | Full-text search |
| Mailpit | `localhost:8025` | Email testing UI |
| Adminer | `localhost:8080` | Database GUI |

### Adminer Login

- **System:** PostgreSQL
- **Server:** postgres
- **Username:** ayushman
- **Password:** ayushman_dev_secret
- **Database:** ayushman_dev

### Mailpit

All emails sent during development are captured at http://localhost:8025 — no real emails are sent.

---

## 6. Starting Development

```bash
# Start everything (recommended)
pnpm dev

# This runs in parallel:
#   Next.js web     → http://localhost:3000
#   NestJS API      → http://localhost:4000
#   Next.js admin   → http://localhost:3001
```

### Verifying the API

```bash
curl http://localhost:4000/api/v1/health
# → {"status":"ok","timestamp":"...","uptime":5,"version":"0.0.0","environment":"development"}
```

### Verifying the Database

```bash
pnpm db:studio
# Opens Prisma Studio at http://localhost:5555
```

---

## 7. IDE Setup

Install the VS Code extensions listed in `.vscode/extensions.json` — VS Code will prompt you automatically.

Key extensions:
- **Prettier** — auto-formatting on save
- **ESLint** — lint errors inline
- **Tailwind CSS IntelliSense** — class autocomplete
- **Prisma** — schema syntax highlighting
- **Error Lens** — inline TypeScript errors

---

## 8. Verify Setup

Run the environment check script:

```bash
pnpm check-env
```

Then verify the full stack:

```bash
# 1. All packages build
pnpm build

# 2. All lint rules pass
pnpm lint

# 3. TypeScript is valid
pnpm type-check

# 4. Tests pass
pnpm test
```

All four commands must exit with code 0 before Phase 0 is considered complete on your machine.

---

## 9. Troubleshooting

### "Port already in use"

```bash
# Find what's using port 5432
lsof -i :5432
# Kill it, or change POSTGRES_PORT in .env
```

### "pnpm: command not found"

```bash
npm install -g pnpm@9
# or
corepack enable && corepack prepare pnpm@9.4.0 --activate
```

### Docker containers exit immediately

```bash
docker compose logs postgres
# Check for disk space issues or permission errors
```

### Prisma client out of date

```bash
pnpm db:generate
```

### "Cannot find module '@ayushman/types'"

Shared packages must be built first:

```bash
pnpm turbo run build --filter=@ayushman/types --filter=@ayushman/config --filter=@ayushman/utils --filter=@ayushman/ui
```
