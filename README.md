# Ayushman — AI-Powered Autism Support Platform

> *Empowering Abilities. Enriching Lives.*

[![CI](https://github.com/ayushman-ngo/ayushman/actions/workflows/ci.yml/badge.svg)](https://github.com/ayushman-ngo/ayushman/actions/workflows/ci.yml)
[![License](https://img.shields.io/badge/license-Proprietary-red.svg)](LICENSE)
[![Node.js](https://img.shields.io/badge/node-%3E%3D20-brightgreen)](https://nodejs.org)
[![pnpm](https://img.shields.io/badge/pnpm-9.x-orange)](https://pnpm.io)

Ayushman is India's most comprehensive AI-powered platform for autism and ADHD support — connecting parents, therapists, schools, NGOs, hospitals, volunteers, government schemes and researchers across India.

---

## Mission

Founded in Bangalore by a parent of a child with autism, Ayushman exists to ensure that no family navigates the journey of autism or ADHD alone. Every feature on this platform is built with one question: **does this help a child thrive?**

---

## Architecture

```
ayushman/
├── apps/
│   ├── web/        Next.js 15 — Public website & parent portal
│   ├── api/        NestJS    — REST API + WebSockets
│   └── admin/      Next.js 15 — Founder admin dashboard
├── packages/
│   ├── ui/         Shared component library (shadcn/ui)
│   ├── types/      Shared TypeScript types
│   ├── config/     Shared runtime configuration
│   ├── utils/      Shared utility functions
│   ├── eslint-config/ Shared ESLint rules
│   └── tsconfig/   Shared TypeScript configs
├── database/
│   ├── prisma/     Schema + migrations
│   └── seeds/      Development seed data
├── infrastructure/
│   ├── docker/     Dockerfiles + Compose
│   ├── terraform/  AWS infrastructure as code
│   ├── nginx/      Reverse proxy configuration
│   └── kubernetes/ K8s manifests
└── docs/           Architecture + ADRs
```

## Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | Next.js 15, React 19, TypeScript, Tailwind CSS, shadcn/ui |
| **Backend** | NestJS, Prisma ORM, PostgreSQL 16 + pgvector |
| **Auth** | NextAuth v5, Passport JWT, bcrypt |
| **AI** | Claude API (Anthropic), OpenAI Embeddings, LangChain, RAG |
| **Cache** | Redis (via IORedis) |
| **Queue** | BullMQ |
| **Search** | Meilisearch |
| **Payments** | Razorpay |
| **Email** | Resend |
| **Storage** | AWS S3 |
| **Monitoring** | Sentry, PostHog |
| **Infrastructure** | Docker, AWS ECS, Terraform, GitHub Actions |

---

## Getting Started

### Prerequisites

- Node.js ≥ 20
- pnpm ≥ 9
- Docker + Docker Compose

### Quick Start

```bash
# 1. Clone
git clone https://github.com/ayushman-ngo/ayushman.git
cd ayushman

# 2. Run the automated setup script
bash scripts/setup.sh

# 3. Start development
pnpm dev
```

See [docs/ENVIRONMENT_SETUP.md](docs/ENVIRONMENT_SETUP.md) for detailed instructions.

### Development URLs

| Service | URL |
|---|---|
| Web App | http://localhost:3000 |
| API | http://localhost:4000/api/v1 |
| API Docs | http://localhost:4000/api/v1/docs |
| Admin | http://localhost:3001 |
| Adminer (DB) | http://localhost:8080 |
| Mailpit (Email) | http://localhost:8025 |
| Meilisearch | http://localhost:7700 |

---

## Development Scripts

```bash
pnpm dev              # Start all apps in parallel
pnpm build            # Build all packages
pnpm lint             # Lint all packages
pnpm type-check       # TypeScript check all packages
pnpm test             # Run all tests
pnpm format           # Format all files with Prettier

pnpm db:migrate       # Run Prisma migrations
pnpm db:seed          # Seed database
pnpm db:studio        # Open Prisma Studio

pnpm docker:dev       # Start Docker dev services
pnpm docker:dev:down  # Stop Docker dev services
```

---

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for our contribution guidelines, coding standards, and pull request process.

## Security

See [SECURITY.md](SECURITY.md) to report vulnerabilities responsibly.

## License

Proprietary. All rights reserved. © 2026 Ayushman NGO.

---

*Built with ♥ for Ayushman — and every extraordinary child like him.*
