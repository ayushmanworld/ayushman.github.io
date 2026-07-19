# ADR 0001 — pnpm Monorepo with Turborepo

**Date:** 2026-01-01
**Status:** Accepted
**Deciders:** BK Satpathy (Founder), Lead Architect

## Context

The Ayushman platform consists of three applications (web, api, admin) and multiple shared packages. We needed a strategy for managing code sharing, dependency versions, build caching, and CI pipelines.

## Decision

Use a **pnpm workspace monorepo** orchestrated by **Turborepo** with the following structure:

```
apps/web       — Next.js 15 public website
apps/api       — NestJS REST API
apps/admin     — Next.js 15 admin dashboard
packages/ui    — Shared UI components
packages/types — Shared TypeScript types
packages/config — Shared runtime configuration
packages/utils — Shared utility functions
```

## Rationale

| Factor | Choice | Reason |
|---|---|---|
| Package manager | pnpm | Disk-efficient, strict dependency isolation, workspace support |
| Build orchestration | Turborepo | Remote caching, parallel builds, dependency graph awareness |
| Code sharing | Internal packages | Type-safe, versioned contracts between apps |
| Dependency management | Single root lockfile | Consistent versions across all packages |

## Consequences

**Positive:**
- Shared types eliminate API/frontend type drift
- Turborepo remote caching cuts CI time by up to 80%
- Single repository for atomic cross-cutting changes
- Shared ESLint and TypeScript configs enforce consistent standards

**Negative:**
- Initial setup complexity higher than polyrepo
- Contributors must understand workspace commands
- All apps must be compatible with pnpm workspace protocol

## Alternatives Considered

- **Separate repositories** — rejected: type sharing requires manual publishing
- **npm workspaces** — rejected: pnpm is significantly more efficient
- **Nx** — rejected: Turborepo is simpler for our current scale
