/**
 * Ayushman RBAC Permission Matrix
 *
 * Defines every permission in the platform and which roles hold them.
 * This is the single source of truth for access control decisions.
 */

// ─────────────────────────────────────────────────
// Permission Enum
// ─────────────────────────────────────────────────

export const Permission = {
  // Users
  USERS_READ_OWN: 'users:read:own',
  USERS_UPDATE_OWN: 'users:update:own',
  USERS_DELETE_OWN: 'users:delete:own',
  USERS_READ_ANY: 'users:read:any',
  USERS_UPDATE_ANY: 'users:update:any',
  USERS_DELETE_ANY: 'users:delete:any',
  USERS_MANAGE_ROLES: 'users:manage:roles',

  // Children
  CHILDREN_CREATE: 'children:create',
  CHILDREN_READ_OWN: 'children:read:own',
  CHILDREN_UPDATE_OWN: 'children:update:own',
  CHILDREN_DELETE_OWN: 'children:delete:own',
  CHILDREN_READ_ANY: 'children:read:any',
  CHILDREN_UPDATE_ANY: 'children:update:any',

  // Therapy
  THERAPY_SESSIONS_CREATE: 'therapy:sessions:create',
  THERAPY_SESSIONS_READ_OWN: 'therapy:sessions:read:own',
  THERAPY_SESSIONS_UPDATE_OWN: 'therapy:sessions:update:own',
  THERAPY_SESSIONS_READ_ANY: 'therapy:sessions:read:any',

  // Goals
  GOALS_CREATE: 'goals:create',
  GOALS_READ_OWN: 'goals:read:own',
  GOALS_UPDATE_OWN: 'goals:update:own',
  GOALS_READ_ANY: 'goals:read:any',

  // Resources
  RESOURCES_READ: 'resources:read',
  RESOURCES_CREATE: 'resources:create',
  RESOURCES_UPDATE: 'resources:update',
  RESOURCES_DELETE: 'resources:delete',
  RESOURCES_VERIFY: 'resources:verify',

  // Partners
  PARTNERS_REGISTER: 'partners:register',
  PARTNERS_READ_OWN: 'partners:read:own',
  PARTNERS_UPDATE_OWN: 'partners:update:own',
  PARTNERS_READ_ANY: 'partners:read:any',
  PARTNERS_APPROVE: 'partners:approve',
  PARTNERS_REJECT: 'partners:reject',
  PARTNERS_SUSPEND: 'partners:suspend',

  // Videos
  VIDEOS_READ: 'videos:read',
  VIDEOS_CREATE: 'videos:create',
  VIDEOS_UPDATE: 'videos:update',
  VIDEOS_DELETE: 'videos:delete',

  // Donations
  DONATIONS_CREATE: 'donations:create',
  DONATIONS_READ_OWN: 'donations:read:own',
  DONATIONS_READ_ANY: 'donations:read:any',
  DONATIONS_REFUND: 'donations:refund',

  // AI
  AI_QUERY: 'ai:query',
  AI_MANAGE: 'ai:manage',

  // Analytics
  ANALYTICS_READ_PUBLIC: 'analytics:read:public',
  ANALYTICS_READ_FULL: 'analytics:read:full',
  ANALYTICS_EXPORT: 'analytics:export',

  // Audit
  AUDIT_READ: 'audit:read',

  // Admin
  ADMIN_PANEL: 'admin:panel',
  ADMIN_SETTINGS: 'admin:settings',
  ADMIN_SYSTEM: 'admin:system',

  // CMS
  CMS_READ: 'cms:read',
  CMS_WRITE: 'cms:write',
  CMS_PUBLISH: 'cms:publish',

  // Forum
  FORUM_POST: 'forum:post',
  FORUM_MODERATE: 'forum:moderate',
} as const

export type Permission = (typeof Permission)[keyof typeof Permission]

// ─────────────────────────────────────────────────
// Role Permission Assignments
// ─────────────────────────────────────────────────

const DONOR_PERMISSIONS: Permission[] = [
  Permission.USERS_READ_OWN,
  Permission.USERS_UPDATE_OWN,
  Permission.RESOURCES_READ,
  Permission.VIDEOS_READ,
  Permission.DONATIONS_CREATE,
  Permission.DONATIONS_READ_OWN,
  Permission.AI_QUERY,
  Permission.ANALYTICS_READ_PUBLIC,
  Permission.FORUM_POST,
]

const PARENT_PERMISSIONS: Permission[] = [
  ...DONOR_PERMISSIONS,
  Permission.CHILDREN_CREATE,
  Permission.CHILDREN_READ_OWN,
  Permission.CHILDREN_UPDATE_OWN,
  Permission.CHILDREN_DELETE_OWN,
  Permission.THERAPY_SESSIONS_CREATE,
  Permission.THERAPY_SESSIONS_READ_OWN,
  Permission.THERAPY_SESSIONS_UPDATE_OWN,
  Permission.GOALS_CREATE,
  Permission.GOALS_READ_OWN,
  Permission.GOALS_UPDATE_OWN,
]

const PARTNER_PERMISSIONS: Permission[] = [
  ...DONOR_PERMISSIONS,
  Permission.PARTNERS_REGISTER,
  Permission.PARTNERS_READ_OWN,
  Permission.PARTNERS_UPDATE_OWN,
  Permission.ANALYTICS_READ_PUBLIC,
]

const THERAPIST_PERMISSIONS: Permission[] = [
  ...PARENT_PERMISSIONS,
  Permission.CHILDREN_READ_ANY,
  Permission.THERAPY_SESSIONS_READ_ANY,
  Permission.GOALS_READ_ANY,
]

const EDUCATOR_PERMISSIONS: Permission[] = [
  ...THERAPIST_PERMISSIONS,
]

const VOLUNTEER_PERMISSIONS: Permission[] = [
  ...DONOR_PERMISSIONS,
  Permission.CHILDREN_READ_ANY,
]

const ADMIN_PERMISSIONS: Permission[] = [
  // All parent/partner permissions
  ...PARENT_PERMISSIONS,
  ...PARTNER_PERMISSIONS,

  // User management
  Permission.USERS_READ_ANY,
  Permission.USERS_UPDATE_ANY,
  Permission.USERS_DELETE_ANY,

  // Children management
  Permission.CHILDREN_READ_ANY,
  Permission.CHILDREN_UPDATE_ANY,

  // Resource management
  Permission.RESOURCES_CREATE,
  Permission.RESOURCES_UPDATE,
  Permission.RESOURCES_DELETE,
  Permission.RESOURCES_VERIFY,

  // Partner management
  Permission.PARTNERS_READ_ANY,
  Permission.PARTNERS_APPROVE,
  Permission.PARTNERS_REJECT,
  Permission.PARTNERS_SUSPEND,

  // Content management
  Permission.VIDEOS_CREATE,
  Permission.VIDEOS_UPDATE,
  Permission.VIDEOS_DELETE,
  Permission.CMS_READ,
  Permission.CMS_WRITE,
  Permission.CMS_PUBLISH,

  // Donations
  Permission.DONATIONS_READ_ANY,
  Permission.DONATIONS_REFUND,

  // Analytics and audit
  Permission.ANALYTICS_READ_FULL,
  Permission.ANALYTICS_EXPORT,
  Permission.AUDIT_READ,

  // AI management
  Permission.AI_MANAGE,

  // Admin panel
  Permission.ADMIN_PANEL,

  // Forum moderation
  Permission.FORUM_MODERATE,
]

const FOUNDER_PERMISSIONS: Permission[] = [
  ...ADMIN_PERMISSIONS,
  Permission.USERS_MANAGE_ROLES,
  Permission.ADMIN_SETTINGS,
  Permission.ADMIN_SYSTEM,
]

// ─────────────────────────────────────────────────
// Permission Matrix (Role → Permissions)
// ─────────────────────────────────────────────────

export const PERMISSION_MATRIX: Record<string, readonly Permission[]> = {
  DONOR:      DONOR_PERMISSIONS,
  PARENT:     PARENT_PERMISSIONS,
  PARTNER:    PARTNER_PERMISSIONS,
  THERAPIST:  THERAPIST_PERMISSIONS,
  EDUCATOR:   EDUCATOR_PERMISSIONS,
  VOLUNTEER:  VOLUNTEER_PERMISSIONS,
  ADMIN:      ADMIN_PERMISSIONS,
  FOUNDER:    FOUNDER_PERMISSIONS,
} as const

/**
 * Check if a given role has a specific permission.
 */
export function roleHasPermission(role: string, permission: Permission): boolean {
  const permissions = PERMISSION_MATRIX[role]
  if (permissions === undefined) {
    return false
  }
  return permissions.includes(permission)
}

/**
 * Get all permissions for a role.
 */
export function getPermissionsForRole(role: string): readonly Permission[] {
  return PERMISSION_MATRIX[role] ?? []
}
