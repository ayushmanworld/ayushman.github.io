# Development Guide

## Prerequisites

| Tool | Version | Install |
|---|---|---|
| Node.js | ≥ 20 LTS | https://nodejs.org |
| pnpm | ≥ 9 | `npm install -g pnpm@9` |
| Docker | ≥ 25 | https://docker.com |
| Git | ≥ 2.40 | https://git-scm.com |

## First-time Setup

```bash
git clone https://github.com/ayushman-ngo/ayushman.git
cd ayushman
bash scripts/setup.sh
```

The setup script handles everything: dependencies, Docker, migrations, seeding, and Husky hooks.

## Daily Development

```bash
# Start all Docker services (first time or after restart)
pnpm docker:dev

# Start all apps with hot reload
pnpm dev

# Or start specific apps
pnpm --filter @ayushman/api dev
pnpm --filter @ayushman/web dev
pnpm --filter @ayushman/admin dev
```

## Committing

We enforce conventional commits via commitlint.

```
feat(auth): add Google OAuth login
fix(donations): correct Razorpay signature verification
docs(readme): update architecture diagram
test(ai): add unit tests for RAG pipeline
security(auth): enforce PKCE for OAuth flows
```

Format: `<type>(<scope>): <subject>`

Valid types: `feat fix docs style refactor perf test build ci chore revert security deps i18n a11y`

## Database

```bash
pnpm db:migrate         # Apply pending migrations
pnpm db:seed            # Seed dev data
pnpm db:studio          # Open Prisma Studio (GUI)
pnpm db:reset           # Reset and re-seed (destructive!)

# After editing prisma/schema.prisma:
pnpm db:generate        # Regenerate Prisma client
pnpm db:migrate         # Create migration file
```

## Testing

```bash
pnpm test                  # All unit + integration tests
pnpm test:coverage         # With coverage report
pnpm --filter @ayushman/api test        # API tests only
pnpm --filter @ayushman/web test:e2e    # Playwright E2E
pnpm --filter @ayushman/utils test      # Utils unit tests
```

## Code Quality

```bash
pnpm lint           # Lint all packages
pnpm lint:fix       # Auto-fix lint errors
pnpm type-check     # TypeScript across all packages
pnpm format         # Format with Prettier
pnpm format:check   # Check formatting (CI mode)
```

## Workspace Package Management

```bash
# Add a dependency to a specific app
pnpm --filter @ayushman/api add nestjs-something

# Add to all apps
pnpm add -w some-dev-tool --save-dev

# Remove a dependency
pnpm --filter @ayushman/web remove some-package
```

## Environment Variables

See `.env.example` for all variables. The minimum required for local development:

```bash
DATABASE_URL=postgresql://ayushman:ayushman_dev_secret@localhost:5432/ayushman_dev
REDIS_URL=redis://localhost:6379
JWT_ACCESS_SECRET=any-string-32-chars-or-longer-here
JWT_REFRESH_SECRET=different-string-32-chars-or-longer
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_API_URL=http://localhost:4000
MEILISEARCH_HOST=http://localhost:7700
```

All other variables (AI keys, Razorpay, etc.) are optional for basic feature development.

## Troubleshooting

**PostgreSQL not connecting:**
```bash
docker compose ps    # Check status
docker compose logs postgres  # Check logs
docker compose restart postgres
```

**Port conflicts:**
Change ports in `.env` (POSTGRES_PORT, REDIS_PORT, etc.) and restart Docker.

**Prisma client out of sync:**
```bash
pnpm db:generate
```

**Turbo cache causing stale builds:**
```bash
pnpm clean
pnpm build
```
