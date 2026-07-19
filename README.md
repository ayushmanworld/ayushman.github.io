# Ayushman — Full-Stack Platform

> Empowering Abilities. Enriching Lives. An NGO for Special-Abled Kids.

## Overview

Ayushman is a production-grade full-stack platform for managing an NGO focused on autism and ADHD support. It includes a public-facing website, a donor portal, an AI-powered research & resource finder, a partner registration system, a curated video library, and a complete admin dashboard — all backed by a robust NestJS API, PostgreSQL database, and a RAG-based AI layer.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 14 (App Router), TypeScript, Tailwind CSS, shadcn/ui |
| Backend | NestJS, TypeScript, REST + WebSockets |
| Database | PostgreSQL + Prisma ORM |
| Auth | NextAuth.js (frontend) + JWT + Passport (backend) |
| AI | Claude claude-sonnet-4-6 (Anthropic) + LangChain + pgvector (RAG) |
| Storage | AWS S3 / Cloudflare R2 |
| Cache | Redis |
| Search | Meilisearch |
| Payments | Razorpay (India) |
| Maps | Google Maps API |
| Email | Resend |
| Monitoring | Sentry + PostHog |
| CI/CD | GitHub Actions |
| Containers | Docker + Docker Compose |
| Cloud | AWS (ECS + RDS + S3) / Vercel (frontend) |

---

## Project Structure

```
Ayushman/
├── frontend/          # Next.js 14 App Router
├── backend/           # NestJS REST API
├── database/          # Prisma schema + migrations + seeds
├── ai/                # RAG pipeline + embeddings + prompts
├── infrastructure/    # Docker, Terraform, Kubernetes, CI/CD
└── docs/              # Architecture, API docs, runbooks
```

---

## Quick Start

### Prerequisites
- Node.js 20+
- Docker + Docker Compose
- PostgreSQL 16
- Redis 7

### 1. Clone & Install
```bash
git clone https://github.com/ayushman-ngo/ayushman.git
cd Ayushman

# Install all dependencies
npm run install:all
```

### 2. Environment Setup
```bash
cp frontend/.env.example frontend/.env.local
cp backend/.env.example backend/.env
```

### 3. Database Setup
```bash
cd database
npx prisma migrate dev
npx prisma db seed
```

### 4. Start Development
```bash
# Start everything with Docker Compose
docker-compose -f infrastructure/docker/docker-compose.dev.yml up

# Or start individually:
cd frontend && npm run dev      # http://localhost:3000
cd backend && npm run start:dev  # http://localhost:4000
```

### 5. Seed the database
```bash
cd database && npm run seed
```

---

## Environment Variables

### Frontend (`frontend/.env.local`)
```
NEXTAUTH_SECRET=
NEXTAUTH_URL=http://localhost:3000
NEXT_PUBLIC_API_URL=http://localhost:4000
NEXT_PUBLIC_GOOGLE_MAPS_KEY=
NEXT_PUBLIC_RAZORPAY_KEY=
NEXT_PUBLIC_POSTHOG_KEY=
SENTRY_DSN=
```

### Backend (`backend/.env`)
```
DATABASE_URL=postgresql://user:pass@localhost:5432/ayushman
REDIS_URL=redis://localhost:6379
JWT_SECRET=
JWT_REFRESH_SECRET=
ANTHROPIC_API_KEY=
RAZORPAY_KEY_ID=
RAZORPAY_KEY_SECRET=
RESEND_API_KEY=
GOOGLE_MAPS_API_KEY=
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
AWS_S3_BUCKET=
MEILISEARCH_HOST=http://localhost:7700
MEILISEARCH_KEY=
SENTRY_DSN=
```

---

## Module Overview

### Frontend Modules
- `/` — Public homepage
- `/research` — AI-powered resource finder
- `/videos` — Verified video library
- `/partners` — Partner registration
- `/dashboard` — Donor & parent dashboard
- `/admin` — Founder admin panel

### Backend Modules
- `AuthModule` — JWT auth, refresh tokens, role-based access
- `UsersModule` — Donors, parents, admins
- `ChildrenModule` — Child profiles & progress
- `DonationsModule` — Razorpay integration, 80G receipts
- `PartnersModule` — Partner registration & approval workflow
- `ResourcesModule` — Resource database + Meilisearch
- `VideosModule` — Video metadata, search, analytics
- `AnalyticsModule` — Search logs, donor heatmaps, country tracking
- `AIModule` — RAG queries, embeddings, Claude integration

---

## Contributing

See [docs/CONTRIBUTING.md](docs/CONTRIBUTING.md)

## License

MIT — See [LICENSE](LICENSE)
