import {
  Injectable,
  ExecutionContext,
  ForbiddenException,
  UnauthorizedException,
} from '@nestjs/common'
import { AuthGuard } from '@nestjs/passport'
import { Reflector } from '@nestjs/core'
import { IS_PUBLIC_KEY, ROLES_KEY, PERMISSIONS_KEY } from '../decorators/auth.decorators'
import { RbacService } from '../../rbac/rbac.service'
import type { Permission } from '../../rbac/permission.matrix'
import type { AuthUser } from '@ayushman/types'

// ─────────────────────────────────────────────────
// JWT Auth Guard (default — applied globally)
// ─────────────────────────────────────────────────

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(private readonly reflector: Reflector) {
    super()
  }

  canActivate(context: ExecutionContext) {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ])
    if (isPublic === true) {
      return true
    }
    return super.canActivate(context)
  }

  handleRequest<T>(err: unknown, user: T): T {
    if (err !== null || user === null || user === undefined || user === false) {
      throw err instanceof Error ? err : new UnauthorizedException('Authentication required')
    }
    return user
  }
}

// ─────────────────────────────────────────────────
// Local Auth Guard (for login endpoint)
// ─────────────────────────────────────────────────

@Injectable()
export class LocalAuthGuard extends AuthGuard('local') {}

// ─────────────────────────────────────────────────
// JWT Refresh Guard
// ─────────────────────────────────────────────────

@Injectable()
export class JwtRefreshGuard extends AuthGuard('jwt-refresh') {}

// ─────────────────────────────────────────────────
// Roles Guard
// ─────────────────────────────────────────────────

@Injectable()
export class RolesGuard {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ])

    if (requiredRoles === undefined || requiredRoles.length === 0) {
      return true
    }

    const request = context.switchToHttp().getRequest<{ user?: AuthUser }>()
    const user = request.user

    if (user === undefined) {
      throw new UnauthorizedException('Authentication required')
    }

    if (!requiredRoles.includes(user.role)) {
      throw new ForbiddenException(
        `This action requires one of these roles: ${requiredRoles.join(', ')}`,
      )
    }

    return true
  }
}

// ─────────────────────────────────────────────────
// Permissions Guard
// ─────────────────────────────────────────────────

@Injectable()
export class PermissionsGuard {
  constructor(
    private readonly reflector: Reflector,
    private readonly rbacService: RbacService,
  ) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredPermissions = this.reflector.getAllAndOverride<Permission[]>(
      PERMISSIONS_KEY,
      [context.getHandler(), context.getClass()],
    )

    if (requiredPermissions === undefined || requiredPermissions.length === 0) {
      return true
    }

    const request = context.switchToHttp().getRequest<{ user?: AuthUser }>()
    const user = request.user

    if (user === undefined) {
      throw new UnauthorizedException('Authentication required')
    }

    const hasAll = this.rbacService.hasAllPermissions(user.role, requiredPermissions)

    if (!hasAll) {
      throw new ForbiddenException('Insufficient permissions')
    }

    return true
  }
}
