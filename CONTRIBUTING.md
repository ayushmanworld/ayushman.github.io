# Contributing to Ayushman

Thank you for contributing to Ayushman. Every improvement to this platform directly impacts the lives of children with autism and their families.

## Code of Conduct

All contributors must follow our [Code of Conduct](CODE_OF_CONDUCT.md).

## Development Workflow

1. **Fork** the repository
2. **Create** a feature branch from `develop`: `git checkout -b feat/your-feature`
3. **Implement** your changes following the standards below
4. **Test** your changes: `pnpm test && pnpm type-check && pnpm lint`
5. **Commit** using conventional commits: `git commit -m "feat(scope): description"`
6. **Push** your branch: `git push origin feat/your-feature`
7. **Open** a pull request to `develop`

## Pull Request Requirements

All PRs must:

- [ ] Pass all CI checks (lint, type-check, tests, build)
- [ ] Have no placeholder code or TODOs
- [ ] Include tests for new functionality (minimum 80% coverage)
- [ ] Update documentation if behaviour changes
- [ ] Have a meaningful description explaining what and why
- [ ] Reference any related issues

## Coding Standards

### TypeScript
- Strict mode enabled (`"strict": true`)
- No `any` types
- Prefer `interface` over `type` for object shapes
- Use `readonly` for immutable data

### Components
- Functional components only
- Props must be typed with `interface`
- Every component needs a `displayName` for debugging
- Accessibility: all interactive elements must have keyboard support and ARIA labels

### API
- Every endpoint must have Swagger documentation
- Every endpoint must have request validation (class-validator)
- Every endpoint must respect RBAC
- Every write operation must create an audit log

### Testing
- Unit tests for all service methods
- Integration tests for all API endpoints
- Test file collocated with source: `feature.service.spec.ts`
- E2E tests for critical user flows in `apps/web/e2e/`

## Security

Never commit:
- API keys, secrets, or tokens
- Passwords or credentials
- Private keys or certificates

Report security vulnerabilities via [SECURITY.md](SECURITY.md).
