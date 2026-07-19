# Ayushman — System Architecture

## Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                        AYUSHMAN PLATFORM                        │
├──────────────────────────────┬──────────────────────────────────┤
│         FRONTEND             │            BACKEND               │
│     Next.js 14 (Vercel)      │        NestJS (AWS ECS)          │
│                              │                                  │
│  ┌─────────────────────┐     │  ┌───────────────────────────┐   │
│  │ Public Pages        │     │  │ REST API (v1)             │   │
│  │  / — Homepage       │     │  │  /auth — JWT + Refresh    │   │
│  │  /research — Finder │◄────┼──│  /donations — Razorpay    │   │
│  │  /videos — Library  │     │  │  /resources — Search      │   │
│  │  /partners — Reg.   │     │  │  /partners — Workflow     │   │
│  └─────────────────────┘     │  │  /videos — Metadata       │   │
│                              │  │  /analytics — Tracking    │   │
│  ┌─────────────────────┐     │  │  /ai — RAG + Claude       │   │
│  │ Auth Pages          │     │  └───────────────────────────┘   │
│  │  /login             │     │                                  │
│  │  /register          │     │  ┌───────────────────────────┐   │
│  │  /dashboard         │     │  │ WebSocket Gateway         │   │
│  └─────────────────────┘     │  │  - Live donation counter  │   │
│                              │  │  - Real-time analytics    │   │
│  ┌─────────────────────┐     │  └───────────────────────────┘   │
│  │ Admin Panel         │     │                                  │
│  │  /admin/dashboard   │     └──────────────────────────────────┘
│  │  /admin/partners    │
│  │  /admin/donations   │     ┌──────────────────────────────────┐
│  │  /admin/resources   │     │           DATA LAYER             │
│  └─────────────────────┘     │                                  │
└──────────────────────────────┤  PostgreSQL 16 + pgvector (RDS)  │
                               │  ┌────────────────────────────┐  │
                               │  │ Tables                     │  │
                               │  │  users, children           │  │
                               │  │  donations, utilizations   │  │
                               │  │  resources, partners       │  │
                               │  │  videos, video_views       │  │
                               │  │  search_logs, ai_sessions  │  │
                               │  │  knowledge_chunks (vector) │  │
                               │  └────────────────────────────┘  │
                               │                                  │
                               │  Redis 7 (ElastiCache)           │
                               │  ┌────────────────────────────┐  │
                               │  │  Session cache             │  │
                               │  │  API response cache        │  │
                               │  │  Rate limiting counters    │  │
                               │  │  Real-time counters        │  │
                               │  └────────────────────────────┘  │
                               │                                  │
                               │  Meilisearch                     │
                               │  ┌────────────────────────────┐  │
                               │  │  Resource full-text search │  │
                               │  │  Video search index        │  │
                               │  │  Typo-tolerant queries     │  │
                               │  └────────────────────────────┘  │
                               └──────────────────────────────────┘

                               ┌──────────────────────────────────┐
                               │         AI LAYER                 │
                               │                                  │
                               │  Claude claude-sonnet-4-6 (Anthropic)     │
                               │  ┌────────────────────────────┐  │
                               │  │  RAG Pipeline              │  │
                               │  │   1. User query            │  │
                               │  │   2. pgvector similarity   │  │
                               │  │   3. Context retrieval     │  │
                               │  │   4. Resource injection    │  │
                               │  │   5. Claude generation     │  │
                               │  │   6. Source citation       │  │
                               │  └────────────────────────────┘  │
                               │                                  │
                               │  Knowledge Base (pgvector)       │
                               │  ┌────────────────────────────┐  │
                               │  │  Autism/ADHD FAQ           │  │
                               │  │  Therapy guides            │  │
                               │  │  Govt scheme details       │  │
                               │  │  Legal rights (RPwD 2016)  │  │
                               │  │  Hindi language content    │  │
                               │  └────────────────────────────┘  │
                               └──────────────────────────────────┘

                               ┌──────────────────────────────────┐
                               │      EXTERNAL SERVICES           │
                               │                                  │
                               │  Razorpay — Payment processing   │
                               │  Resend — Transactional email    │
                               │  Google Maps — Geo tagging       │
                               │  PostHog — Product analytics     │
                               │  Sentry — Error monitoring       │
                               │  AWS S3/R2 — File storage        │
                               └──────────────────────────────────┘
```

## Data Flow — Donation

```
User fills donation form
       │
       ▼
POST /api/v1/donations/create-order
       │
       ▼ (creates Razorpay order)
Razorpay order created
       │
       ▼
Razorpay payment modal opens (frontend)
       │
       ▼ (user pays)
POST /api/v1/donations/verify
       │
       ├── Verify Razorpay signature (HMAC)
       ├── Update donation status → COMPLETED
       ├── Update location stats (country/state)
       ├── Generate receipt number
       ├── Send 80G receipt email via Resend
       └── Emit WebSocket event (live counter update)
```

## Data Flow — AI Query

```
User types question in AI Assistant
       │
       ▼
POST /api/v1/ai/query
       │
       ├── Detect language (en/hi)
       ├── Detect categories (therapy/school/govt/etc)
       │
       ▼
pgvector similarity search (knowledge_chunks)
       │
       ▼
Fetch relevant resources from DB (by city)
       │
       ▼
Build context-enriched system prompt
       │
       ▼
Call Claude claude-sonnet-4-6 with full conversation history
       │
       ▼
Extract resource citations from response
       │
       ├── Save turn to ai_sessions table
       ├── Return answer + sources + sessionId
       └── Log analytics (no PII)
```

## Data Flow — Partner Registration

```
Partner fills registration form
       │
       ▼
POST /api/v1/partners/register
       │
       ├── Create partner record (status: PENDING)
       ├── Generate registration ID (REG-YYYY-XXXXX)
       ├── Email founder (ayushmans@outlook.in)
       └── Email partner (confirmation)

Founder reviews in admin panel
       │
       ├── APPROVE
       │       ├── Create verified Resource record
       │       ├── Update partner status → APPROVED
       │       ├── Set isVisible = true
       │       ├── Email partner (approved + live)
       │       └── Resource appears in /research finder
       │
       └── REJECT
               ├── Update status → REJECTED
               ├── Store rejection reason
               └── Email partner (with reason)
```

## Security Architecture

```
Public endpoints (no auth required):
  GET  /resources — search
  GET  /videos
  POST /donations/create-order
  POST /donations/verify
  POST /ai/query
  POST /analytics/search

Protected endpoints (JWT required):
  GET  /dashboard
  GET  /donations/:id/receipt
  POST /children

Admin/Founder only (role-based):
  GET  /admin/partners/pending
  POST /admin/partners/:id/approve
  POST /admin/partners/:id/reject
  GET  /admin/analytics
  POST /resources (create)
  PUT  /resources/:id (edit)

Security measures:
  - Rate limiting (ThrottlerGuard): 10 req/s, 50 req/10s, 200 req/min
  - Helmet.js for security headers
  - CORS whitelist
  - JWT with refresh token rotation
  - Bcrypt password hashing (rounds: 12)
  - Input validation (class-validator)
  - SQL injection prevention (Prisma parameterized queries)
  - Razorpay signature verification (HMAC-SHA256)
```

## Deployment Architecture (AWS)

```
Route 53 (DNS)
  ayushman.world → Vercel (frontend)
  api.ayushman.world → ALB → ECS Fargate (backend)
  
ECS Fargate:
  - Backend service: 2 tasks × 0.5 vCPU / 1GB RAM
  - Auto-scaling: CPU > 70% → scale up

RDS PostgreSQL:
  - Instance: db.t3.small
  - Multi-AZ: enabled in production
  - Automated backups: 7 days

ElastiCache Redis:
  - Instance: cache.t3.micro
  - Replication: enabled

Secrets: AWS Secrets Manager
Logs: CloudWatch
Monitoring: CloudWatch + Sentry
CDN: CloudFront for static assets
```

## Environment Variables Reference

See `.env.example` files in `frontend/` and `backend/` directories.
Critical variables:
- `ANTHROPIC_API_KEY` — Claude AI
- `DATABASE_URL` — PostgreSQL connection string
- `RAZORPAY_KEY_ID` / `RAZORPAY_KEY_SECRET` — Payments
- `RESEND_API_KEY` — Transactional email
- `GOOGLE_MAPS_API_KEY` — Map integration
- `JWT_SECRET` / `JWT_REFRESH_SECRET` — Auth
