# Security Policy

## Supported Versions

| Version | Supported |
|---|---|
| Latest (main) | ✅ |
| Staging | ✅ |
| Older | ❌ |

## Reporting a Vulnerability

**Do not open a GitHub issue for security vulnerabilities.**

Email: **security@ayushman.world**

Include:
- Description of the vulnerability
- Steps to reproduce
- Potential impact
- Your suggested fix (if any)

We will acknowledge within 48 hours and resolve critical issues within 7 days.

## Security Measures

- Dependency scanning (automated daily)
- CodeQL static analysis on every PR
- Container vulnerability scanning (Trivy)
- Secret scanning (TruffleHog)
- OWASP Top 10 compliance
- CSRF protection on all state-changing endpoints
- Rate limiting on all public endpoints
- SQL injection prevention via Prisma parameterised queries
- XSS prevention via React's default escaping + CSP headers
- JWT with short expiry (15 minutes) and refresh rotation
