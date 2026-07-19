import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'
import { AuditService } from '../audit/audit.service'
import type { UpdateUserDto, AdminUpdateUserDto, UserQueryDto } from './dto/users.dto'
import type { AuthUser } from '@ayushman/types'

const USER_SELECT = {
  id: true,
  email: true,
  name: true,
  phone: true,
  role: true,
  status: true,
  isEmailVerified: true,
  avatarUrl: true,
  country: true,
  state: true,
  city: true,
  language: true,
  newsletterOptIn: true,
  lastLoginAt: true,
  createdAt: true,
  updatedAt: true,
} as const

@Injectable()
export class UsersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditService,
  ) {}

  // ─────────────────────────────────────────────────
  // Find own profile
  // ─────────────────────────────────────────────────

  async findMe(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: USER_SELECT,
    })

    if (user === null) {
      throw new NotFoundException('User not found')
    }

    return user
  }

  // ─────────────────────────────────────────────────
  // Update own profile
  // ─────────────────────────────────────────────────

  async updateMe(userId: string, dto: UpdateUserDto): Promise<typeof USER_SELECT extends Record<string, boolean> ? object : never> {
    const before = await this.prisma.user.findUnique({
      where: { id: userId },
      select: USER_SELECT,
    })

    if (before === null) {
      throw new NotFoundException('User not found')
    }

    const updated = await this.prisma.user.update({
      where: { id: userId },
      data: dto,
      select: USER_SELECT,
    })

    await this.audit.logUpdate({
      actorId: userId,
      entityType: 'User',
      entityId: userId,
      before: before as Record<string, unknown>,
      after: dto as Record<string, unknown>,
    })

    return updated as unknown as typeof USER_SELECT extends Record<string, boolean> ? object : never
  }

  // ─────────────────────────────────────────────────
  // Delete own account (soft delete)
  // ─────────────────────────────────────────────────

  async deleteMe(userId: string): Promise<void> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, role: true },
    })

    if (user === null) {
      throw new NotFoundException('User not found')
    }

    if (user.role === 'ADMIN' || user.role === 'FOUNDER') {
      throw new ForbiddenException('Admin accounts cannot be self-deleted')
    }

    await this.prisma.$transaction([
      this.prisma.user.update({
        where: { id: userId },
        data: {
          deletedAt: new Date(),
          deletedBy: userId,
          status: 'DELETED',
          email: `deleted_${userId}@deleted.ayushman.world`,
        },
      }),
      this.prisma.userSession.updateMany({
        where: { userId, isRevoked: false },
        data: { isRevoked: true },
      }),
    ])

    await this.audit.logDelete({
      actorId: userId,
      entityType: 'User',
      entityId: userId,
      data: { reason: 'self-deletion' },
    })
  }

  // ─────────────────────────────────────────────────
  // Admin: list users with pagination + filter
  // ─────────────────────────────────────────────────

  async findAll(query: UserQueryDto) {
    const page = query.page ?? 1
    const limit = Math.min(query.limit ?? 20, 100)
    const skip = (page - 1) * limit

    const where = {
      deletedAt: null,
      ...(query.search !== undefined && query.search !== '' && {
        OR: [
          { name: { contains: query.search, mode: 'insensitive' as const } },
          { email: { contains: query.search, mode: 'insensitive' as const } },
        ],
      }),
      ...(query.role !== undefined && { role: query.role }),
      ...(query.status !== undefined && { status: query.status }),
    }

    const orderBy = query.sortBy !== undefined
      ? { [query.sortBy]: query.sortOrder ?? 'desc' }
      : { createdAt: 'desc' as const }

    const [users, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        select: USER_SELECT,
        skip,
        take: limit,
        orderBy,
      }),
      this.prisma.user.count({ where }),
    ])

    return {
      items: users,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      hasNextPage: page * limit < total,
      hasPreviousPage: page > 1,
    }
  }

  // ─────────────────────────────────────────────────
  // Admin: find user by ID
  // ─────────────────────────────────────────────────

  async findById(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: {
        ...USER_SELECT,
        _count: {
          select: {
            children: true,
            donations: true,
          },
        },
      },
    })

    if (user === null) {
      throw new NotFoundException('User not found')
    }

    return user
  }

  // ─────────────────────────────────────────────────
  // Admin: update any user
  // ─────────────────────────────────────────────────

  async adminUpdate(
    targetId: string,
    dto: AdminUpdateUserDto,
    actor: AuthUser,
  ) {
    const before = await this.findById(targetId)

    const updated = await this.prisma.user.update({
      where: { id: targetId },
      data: dto,
      select: USER_SELECT,
    })

    await this.audit.logUpdate({
      actorId: actor.id,
      entityType: 'User',
      entityId: targetId,
      before: before as Record<string, unknown>,
      after: dto as Record<string, unknown>,
    })

    return updated
  }

  // ─────────────────────────────────────────────────
  // Admin: suspend user
  // ─────────────────────────────────────────────────

  async suspend(targetId: string, actor: AuthUser): Promise<void> {
    const target = await this.findById(targetId)

    if (target['role'] === 'FOUNDER') {
      throw new ForbiddenException('Cannot suspend the founder account')
    }

    if (target['id'] === actor.id) {
      throw new ForbiddenException('Cannot suspend your own account')
    }

    await this.prisma.user.update({
      where: { id: targetId },
      data: { status: 'SUSPENDED' },
    })

    await this.prisma.userSession.updateMany({
      where: { userId: targetId, isRevoked: false },
      data: { isRevoked: true },
    })

    await this.audit.log({
      actorId: actor.id,
      entityType: 'User',
      entityId: targetId,
      action: 'SUSPEND',
      metadata: { reason: 'Admin suspension' },
    })
  }
}
