import { Test, type TestingModule } from '@nestjs/testing'
import { RbacService } from './rbac.service'
import { Permission } from './permission.matrix'

describe('RbacService', () => {
  let service: RbacService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [RbacService],
    }).compile()

    service = module.get<RbacService>(RbacService)
  })

  describe('hasPermission()', () => {
    it('grants PARENT permission to read own children', () => {
      expect(service.hasPermission('PARENT', Permission.CHILDREN_READ_OWN)).toBe(true)
    })

    it('denies PARENT permission to approve partners', () => {
      expect(service.hasPermission('PARENT', Permission.PARTNERS_APPROVE)).toBe(false)
    })

    it('grants ADMIN permission to approve partners', () => {
      expect(service.hasPermission('ADMIN', Permission.PARTNERS_APPROVE)).toBe(true)
    })

    it('grants FOUNDER all admin permissions', () => {
      expect(service.hasPermission('FOUNDER', Permission.ADMIN_SYSTEM)).toBe(true)
      expect(service.hasPermission('FOUNDER', Permission.USERS_MANAGE_ROLES)).toBe(true)
    })

    it('denies ADMIN system-level permissions', () => {
      expect(service.hasPermission('ADMIN', Permission.ADMIN_SYSTEM)).toBe(false)
    })

    it('returns false for unknown role', () => {
      expect(service.hasPermission('UNKNOWN_ROLE', Permission.AI_QUERY)).toBe(false)
    })
  })

  describe('hasAllPermissions()', () => {
    it('returns true when role has all permissions', () => {
      expect(
        service.hasAllPermissions('PARENT', [
          Permission.CHILDREN_CREATE,
          Permission.CHILDREN_READ_OWN,
          Permission.AI_QUERY,
        ]),
      ).toBe(true)
    })

    it('returns false when role is missing one permission', () => {
      expect(
        service.hasAllPermissions('PARENT', [
          Permission.CHILDREN_CREATE,
          Permission.PARTNERS_APPROVE, // PARENT doesn't have this
        ]),
      ).toBe(false)
    })

    it('returns true for empty permissions array', () => {
      expect(service.hasAllPermissions('PARENT', [])).toBe(true)
    })
  })

  describe('hasAnyPermission()', () => {
    it('returns true when role has at least one permission', () => {
      expect(
        service.hasAnyPermission('DONOR', [
          Permission.PARTNERS_APPROVE, // No
          Permission.RESOURCES_READ,   // Yes
        ]),
      ).toBe(true)
    })

    it('returns false when role has none of the permissions', () => {
      expect(
        service.hasAnyPermission('DONOR', [
          Permission.PARTNERS_APPROVE,
          Permission.ADMIN_PANEL,
        ]),
      ).toBe(false)
    })
  })

  describe('getPermissions()', () => {
    it('returns permissions array for valid role', () => {
      const permissions = service.getPermissions('PARENT')
      expect(permissions.length).toBeGreaterThan(0)
      expect(permissions).toContain(Permission.CHILDREN_CREATE)
    })

    it('returns empty array for unknown role', () => {
      expect(service.getPermissions('GHOST')).toHaveLength(0)
    })
  })
})
