# Ayushman Platform — Roadmap

> Living document. Updated at the start of each phase.

---

## Phase 0 — Repository Foundation ✅ Complete

- [x] pnpm monorepo with Turborepo
- [x] Shared packages: types, config, utils, ui, eslint-config, tsconfig
- [x] Next.js 15 web shell
- [x] NestJS API shell with health endpoint
- [x] Next.js 15 admin shell
- [x] Complete Prisma schema (25+ models, pgvector)
- [x] Docker Compose dev + prod stacks
- [x] GitHub Actions: CI, CD staging, CD production, security scanning
- [x] Husky + commitlint + lint-staged
- [x] Environment validation
- [x] Database seed (8 resources, 15 videos, forum categories)
- [x] Documentation: README, CONTRIBUTING, SECURITY, ARCHITECTURE, DEVELOPMENT, ADRs

---

## Phase 1 — Authentication, RBAC & Database 🔄 Next

- [ ] Prisma migrations (initial schema)
- [ ] Auth module: registration, login, email verification, password reset
- [ ] JWT access + refresh token rotation
- [ ] Passport JWT strategy
- [ ] Role-Based Access Control (RBAC) guard
- [ ] Permission matrix implementation
- [ ] Audit log service
- [ ] User management module (CRUD)
- [ ] Admin user management API
- [ ] NextAuth v5 integration (frontend)
- [ ] Login page, register page, forgot password page
- [ ] Email templates: welcome, verification, password reset
- [ ] Rate limiting per endpoint
- [ ] Session management (Redis)

---

## Phase 2 — Frontend Foundation

- [ ] shadcn/ui component library setup
- [ ] Design system: colours, typography, spacing
- [ ] Navigation: primary nav, mobile nav, footer
- [ ] Dark mode implementation
- [ ] Toast notification system
- [ ] Loading states & skeleton screens
- [ ] Error boundary components
- [ ] Form primitives with React Hook Form + Zod
- [ ] Responsive grid system
- [ ] SEO: sitemap, robots.txt, structured data
- [ ] PWA manifest + service worker
- [ ] Accessibility audit (WCAG 2.2 AA)

---

## Phase 3 — Parent Dashboard

- [ ] Dashboard home with stats overview
- [ ] Child selector (multi-child support)
- [ ] Recent activity feed
- [ ] Appointment calendar widget
- [ ] Quick actions panel
- [ ] Notification centre
- [ ] Profile settings page
- [ ] Account preferences page

---

## Phase 4 — Child Management

- [ ] Child profile create / edit / delete
- [ ] Diagnosis journey timeline
- [ ] Goal tracking (create, update, mark achieved)
- [ ] Progress notes with rich text
- [ ] Therapy session log
- [ ] Behaviour tracking (ABC charts)
- [ ] Mood tracking calendar
- [ ] Medication management
- [ ] Appointment booking and history
- [ ] Visual schedule builder
- [ ] Daily routine tracker

---

## Phase 5 — Therapy Planning

- [ ] Therapy planner interface
- [ ] ABA program builder
- [ ] Speech therapy goals
- [ ] OT (Occupational Therapy) session planner
- [ ] Sensory profile assessment
- [ ] Physiotherapy exercise library
- [ ] Therapist directory integration
- [ ] Session notes with voice-to-text
- [ ] Progress charts (Recharts)

---

## Phase 6 — Research Library

- [ ] Resource directory (full Meilisearch integration)
- [ ] Smart resource finder with AI matching
- [ ] Resource detail pages with contact forms
- [ ] Video library (25+ verified videos)
- [ ] Video search and filtering
- [ ] Video watch tracking
- [ ] Government schemes directory
- [ ] Downloads library (PDFs, guides)
- [ ] Research papers index

---

## Phase 7 — AI Assistant

- [ ] RAG pipeline implementation (pgvector + LangChain)
- [ ] Knowledge ingestion pipeline
- [ ] OpenAI embeddings integration
- [ ] Claude API streaming responses
- [ ] Multi-turn conversation memory
- [ ] Citation system
- [ ] Hallucination reduction filters
- [ ] Hindi language support
- [ ] Safety filters
- [ ] AI assistant chat UI with streaming
- [ ] Session persistence and history

---

## Phase 8 — Partner Portal

- [ ] Partner registration form (full)
- [ ] Partner approval workflow (founder review)
- [ ] Partner profile pages
- [ ] Google Maps integration
- [ ] Partner analytics dashboard
- [ ] Partner directory with search
- [ ] Razorpay payment for registration fee
- [ ] Partner email notifications
- [ ] Partner verification badge system

---

## Phase 9 — Donation Platform

- [ ] Donation form with Razorpay integration
- [ ] Cause selection (therapy, school, general, etc.)
- [ ] Donation confirmation + receipt email
- [ ] 80G tax receipt generation (PDF)
- [ ] Donor dashboard
- [ ] Donation history
- [ ] Fund utilisation tracker
- [ ] Live donation counter (WebSocket)
- [ ] Donation location heatmap
- [ ] Campaign pages
- [ ] Recurring donations

---

## Phase 10 — Analytics

- [ ] Public stats dashboard (homepage)
- [ ] Donation analytics (country, state, cause)
- [ ] Resource search analytics
- [ ] Video view analytics
- [ ] AI query analytics
- [ ] PostHog integration
- [ ] Admin analytics dashboard
- [ ] Exportable reports (CSV, PDF)

---

## Phase 11 — Admin Portal

- [ ] Admin dashboard with KPIs
- [ ] Partner management (approve, reject, suspend)
- [ ] Resource management (CRUD, verification)
- [ ] User management (roles, suspension)
- [ ] Donation management and reporting
- [ ] Content management (CMS for pages)
- [ ] Video library management
- [ ] Knowledge base management
- [ ] Audit log viewer
- [ ] System health monitoring

---

## Phase 12 — Testing

- [ ] Unit tests: 90% coverage (API services)
- [ ] Integration tests: all API endpoints
- [ ] E2E tests: critical user flows (Playwright)
  - [ ] Registration → login
  - [ ] Child profile creation
  - [ ] Resource search
  - [ ] Donation flow
  - [ ] AI query
- [ ] Performance testing (k6)
- [ ] Accessibility audit (axe-core)
- [ ] Security penetration test

---

## Phase 13 — Production Deployment

- [ ] Terraform: AWS infrastructure (ECS, RDS, ElastiCache, S3, CloudFront)
- [ ] Domain and SSL configuration
- [ ] CloudFront CDN setup
- [ ] RDS PostgreSQL with Multi-AZ
- [ ] ElastiCache Redis cluster
- [ ] AWS Secrets Manager integration
- [ ] Sentry error monitoring (prod)
- [ ] CloudWatch alarms
- [ ] Backup and disaster recovery plan
- [ ] Load testing sign-off
- [ ] Go-live checklist
- [ ] Runbook documentation

---

## Beyond v1.0

- [ ] Mobile apps (React Native)
- [ ] Multilingual support (10 Indian languages)
- [ ] Therapist portal (separate app)
- [ ] School portal
- [ ] NGO collaboration platform
- [ ] Government scheme application tracking
- [ ] Research data aggregation
- [ ] Volunteer management
- [ ] Telehealth integration
- [ ] WhatsApp bot (AI assistant)
