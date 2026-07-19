import { Injectable } from '@nestjs/common'
import { type Permission, roleHasPermission, getPermissionsForRole } from './permission.matrix'

@Injectable()
export class RbacService {
  /**
   * Check if a role has a specific permission.
   */
  hasPermission(role: string, permission: Permission): boolean {
    return roleHasPermission(role, permission)
  }

  /**
   * Check if a role has ALL of the specified permissions.
   */
  hasAllPermissions(role: string, permissions: Permission[]): boolean {
    return permissions.every((p) => roleHasPermission(role, p))
  }

  /**
   * Check if a role has ANY of the specified permissions.
   */
  hasAnyPermission(role: string, permissions: Permission[]): boolean {
    return permissions.some((p) => roleHasPermission(role, p))
  }

  /**
   * Get all permissions for a role.
   */
  getPermissions(role: string): readonly Permission[] {
    return getPermissionsForRole(role)
  }
}
