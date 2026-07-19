# Changelog

All notable changes to the Ayushman Platform are documented in this file.

The format follows [Keep a Changelog](https://keepachangelog.com/en/1.0.0/)
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [Unreleased]

### Added
- Phase 0: Repository foundation
  - pnpm monorepo with Turborepo orchestration
  - Shared packages: types, config, utils, ui, eslint-config, tsconfig
  - Next.js 15 web app shell (apps/web)
  - NestJS API shell with health endpoint (apps/api)
  - Next.js 15 admin app shell (apps/admin)
  - Complete Prisma schema with 25+ models
  - Docker Compose development stack (PostgreSQL 16 + pgvector, Redis, Meilisearch, Mailpit, Adminer)
  - Docker Compose production stack with Nginx
  - GitHub Actions: CI, CD staging, CD production, security scanning
  - Husky + commitlint + lint-staged Git hooks
  - Prettier + ESLint with strict rules
  - Environment validation (Zod)
  - Database seed script with 8 resources, 15 videos, forum categories
  - VS Code workspace settings and recommended extensions
  - Complete documentation (README, CONTRIBUTING, SECURITY, ARCHITECTURE, DEVELOPMENT, ADR)
