import { createParamDecorator, type ExecutionContext, SetMetadata } from '@nestjs/common'
import type { Request } from 'express'
import type { AuthUser } from '@ayushman/types'
import type { Permission } from '../rbac/permission.matrix'

// ─────────────────────────────────────────────────
// CurrentUser decorator
// ─────────────────────────────────────────────────

export const CurrentUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): AuthUser => {
    const request = ctx.switchToHttp().getRequest<Request>()
    return request.user as AuthUser
  },
)

// ─────────────────────────────────────────────────
// Roles decorator
// ─────────────────────────────────────────────────

export const ROLES_KEY = 'roles'
export const Roles = (...roles: string[]) => SetMetadata(ROLES_KEY, roles)

// ─────────────────────────────────────────────────
// Permissions decorator
// ─────────────────────────────────────────────────

export const PERMISSIONS_KEY = 'permissions'
export const RequirePermissions = (...permissions: Permission[]) =>
  SetMetadata(PERMISSIONS_KEY, permissions)

// ─────────────────────────────────────────────────
// Public decorator (skip auth guard)
// ─────────────────────────────────────────────────

export const IS_PUBLIC_KEY = 'isPublic'
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true)

// ─────────────────────────────────────────────────
// IP Address decorator
// ─────────────────────────────────────────────────

export const IpAddress = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): string => {
    const request = ctx.switchToHttp().getRequest<Request>()
    const forwarded = request.headers['x-forwarded-for']
    if (typeof forwarded === 'string') {
      return forwarded.split(',')[0]?.trim() ?? request.ip ?? ''
    }
    return request.ip ?? ''
  },
)

// ─────────────────────────────────────────────────
// User Agent decorator
// ─────────────────────────────────────────────────

export const UserAgent = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): string => {
    const request = ctx.switchToHttp().getRequest<Request>()
    return request.headers['user-agent'] ?? ''
  },
)
