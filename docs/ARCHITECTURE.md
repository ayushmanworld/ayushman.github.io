# Architecture — Ayushman Platform

## System Architecture Diagram

```
┌─────────────────── EXTERNAL CLIENTS ─────────────────────────────┐
│  Browser   Android/iOS PWA    Admin Browser   API Consumers       │
└────────────┬──────────────────┬──────────────┬────────────────────┘
             │                  │              │
             ▼                  ▼              ▼
┌─────────── CDN / EDGE ────────────────────────────────────────────┐
│         CloudFront (Static Assets, Edge Caching)                  │
│         Nginx (Reverse Proxy, Rate Limiting, TLS)                 │
└───────────┬───────────────────────────────────────────────────────┘
            │
    ┌───────┴────────────────────────┐
    ▼                                ▼
┌───────────────┐          ┌────────────────────┐
│  Next.js Web  │          │  NestJS REST API   │
│  (apps/web)   │◄────────►│  (apps/api)        │
│  Port: 3000   │  HTTP    │  Port: 4000        │
└───────────────┘          └────────┬───────────┘
                                    │
          ┌─────────────────────────┼─────────────────────────┐
          ▼                         ▼                         ▼
  ┌───────────────┐        ┌───────────────┐        ┌────────────────┐
  │  PostgreSQL   │        │     Redis     │        │  Meilisearch   │
  │  (pgvector)   │        │   (Cache +    │        │   (Full-text   │
  │  Port: 5432   │        │    Queues)    │        │    Search)     │
  └───────────────┘        └───────────────┘        └────────────────┘
          │
          │ pgvector
          ▼
  ┌───────────────┐
  │  AI / RAG     │
  │  Claude API   │
  │  OpenAI Embed │
  └───────────────┘

  ┌──────────────────── EXTERNAL SERVICES ────────────────────────┐
  │  Razorpay (Payments)  Resend (Email)  AWS S3 (Storage)        │
  │  Sentry (Errors)      PostHog (Analytics)                     │
  └───────────────────────────────────────────────────────────────┘
```

## Domain Model

```
Users
  └── Children (1:many)
        ├── Goals (1:many)
        ├── TherapySessions (1:many)
        ├── Appointments (1:many)
        ├── BehaviourLogs (1:many)
        ├── MoodLogs (1:many)
        └── Medications (1:many)

Resources
  └── ResourceViews
  └── ContactRequests

Partners
  └── User (1:1)
  └── Resource (1:1, once approved)

Donations
  └── User (optional)
  └── DonationUtilizations (1:many)

Videos
  └── VideoViews (1:many)

KnowledgeChunks (pgvector embeddings)
  └── AiSession.turns

ForumCategories
  └── ForumPosts (1:many)
        └── ForumReplies (1:many)
```

## Data Flow — AI Query (RAG)

```
User query
    │
    ▼
1. Detect language + intent (NestJS AI module)
    │
    ▼
2. Generate query embedding (OpenAI text-embedding-3-small)
    │
    ▼
3. pgvector similarity search → top-5 KnowledgeChunks
    │
    ▼
4. Fetch relevant Resources from DB (by city/diagnosis)
    │
    ▼
5. Build system prompt with context injection
    │
    ▼
6. Stream response via Claude claude-sonnet-4-6
    │
    ▼
7. Extract source citations
    │
    ▼
8. Persist AiSession.turns in PostgreSQL
    │
    ▼
Response with answer + sources + sessionId
```

## Security Architecture

| Layer | Control |
|---|---|
| Network | Nginx rate limiting, WAF, CloudFront |
| Transport | TLS 1.2+ (enforced by Nginx) |
| Application | Helmet.js, CSRF tokens, CORS whitelist |
| Authentication | JWT (15m access + 7d refresh, HttpOnly cookies) |
| Authorisation | Role-Based Access Control (RBAC), permission matrix |
| Data | Prisma parameterised queries (SQL injection prevention) |
| Passwords | bcrypt (12 rounds) |
| Payments | Razorpay HMAC-SHA256 signature verification |
| Secrets | AWS Secrets Manager (production), .env (dev, gitignored) |
| Audit | Complete audit log for all writes and admin actions |

## Deployment Architecture (AWS)

```
Route 53
├── ayushman.world       → CloudFront → Vercel (web)
├── api.ayushman.world   → ALB → ECS Fargate (api)
└── admin.ayushman.world → CloudFront → Vercel (admin)

ECS Fargate (ap-south-1)
├── ayushman-api (2 tasks, 0.5 vCPU / 1GB RAM, auto-scale)
└── ayushman-migrate (1-off task for DB migrations)

RDS PostgreSQL 16
├── Multi-AZ enabled (production)
├── pgvector extension
└── Automated snapshots (7 day retention)

ElastiCache Redis 7
├── Single-node (dev/staging)
└── Cluster mode (production)

S3 Buckets
├── ayushman-uploads-{env}  (user uploads)
└── ayushman-assets-{env}   (static assets)
```

## ADR Index

| # | Decision | Status |
|---|---|---|
| [0001](adr/0001-monorepo-structure.md) | pnpm monorepo with Turborepo | Accepted |

---

*Last updated: Phase 0 — Repository Foundation*
