import { Injectable, Logger } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'
import type { AuditAction } from '@prisma/client'

export interface CreateAuditLogDto {
  actorId?: string
  subjectId?: string
  action: AuditAction
  entityType: string
  entityId?: string
  before?: Record<string, unknown>
  after?: Record<string, unknown>
  ipAddress?: string
  userAgent?: string
  metadata?: Record<string, unknown>
}

@Injectable()
export class AuditService {
  private readonly logger = new Logger(AuditService.name)

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Create an audit log entry.
   * Non-blocking — errors are logged but do not propagate.
   */
  async log(dto: CreateAuditLogDto): Promise<void> {
    try {
      await this.prisma.auditLog.create({ data: dto })
    } catch (error) {
      // Audit log failure must never break the main operation
      this.logger.error('Failed to write audit log', error)
    }
  }

  /**
   * Log a create action.
   */
  async logCreate(params: {
    actorId?: string
    entityType: string
    entityId: string
    data: Record<string, unknown>
    ipAddress?: string
  }): Promise<void> {
    await this.log({
      actorId: params.actorId,
      action: 'CREATE',
      entityType: params.entityType,
      entityId: params.entityId,
      after: params.data,
      ipAddress: params.ipAddress,
    })
  }

  /**
   * Log an update action with before/after state.
   */
  async logUpdate(params: {
    actorId?: string
    entityType: string
    entityId: string
    before: Record<string, unknown>
    after: Record<string, unknown>
    ipAddress?: string
  }): Promise<void> {
    await this.log({
      actorId: params.actorId,
      action: 'UPDATE',
      entityType: params.entityType,
      entityId: params.entityId,
      before: params.before,
      after: params.after,
      ipAddress: params.ipAddress,
    })
  }

  /**
   * Log a delete action.
   */
  async logDelete(params: {
    actorId?: string
    entityType: string
    entityId: string
    data: Record<string, unknown>
    ipAddress?: string
  }): Promise<void> {
    await this.log({
      actorId: params.actorId,
      action: 'DELETE',
      entityType: params.entityType,
      entityId: params.entityId,
      before: params.data,
      ipAddress: params.ipAddress,
    })
  }

  /**
   * Log a login event.
   */
  async logLogin(params: {
    actorId: string
    ipAddress?: string
    userAgent?: string
    success: boolean
  }): Promise<void> {
    await this.log({
      actorId: params.actorId,
      action: 'LOGIN',
      entityType: 'User',
      entityId: params.actorId,
      ipAddress: params.ipAddress,
      userAgent: params.userAgent,
      metadata: { success: params.success },
    })
  }

  /**
   * Paginated audit log query (admin only).
   */
  async getAuditLogs(params: {
    page?: number
    limit?: number
    actorId?: string
    entityType?: string
    action?: AuditAction
  }) {
    const page = params.page ?? 1
    const limit = Math.min(params.limit ?? 20, 100)
    const skip = (page - 1) * limit

    const where = {
      ...(params.actorId !== undefined && { actorId: params.actorId }),
      ...(params.entityType !== undefined && { entityType: params.entityType }),
      ...(params.action !== undefined && { action: params.action }),
    }

    const [items, total] = await Promise.all([
      this.prisma.auditLog.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          actor: { select: { id: true, name: true, email: true, role: true } },
        },
      }),
      this.prisma.auditLog.count({ where }),
    ])

    return {
      items,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      hasNextPage: page * limit < total,
      hasPreviousPage: page > 1,
    }
  }
}
