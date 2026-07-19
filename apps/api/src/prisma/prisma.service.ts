import {
  Injectable,
  Logger,
  OnModuleInit,
  OnModuleDestroy,
} from '@nestjs/common'
import { PrismaClient } from '@prisma/client'
import { ConfigService } from '@nestjs/config'

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  private readonly logger = new Logger(PrismaService.name)

  constructor(private readonly config: ConfigService) {
    super({
      datasources: {
        db: { url: config.get<string>('DATABASE_URL') },
      },
      log: [
        { emit: 'event', level: 'query' },
        { emit: 'event', level: 'error' },
        { emit: 'event', level: 'warn' },
      ],
    })

    // Log slow queries in development
    if (config.get('NODE_ENV') !== 'production') {
      // @ts-expect-error — Prisma event typing
      this.$on('query', (e: { duration: number; query: string }) => {
        if (e.duration > 200) {
          this.logger.warn(`Slow query (${e.duration}ms): ${e.query}`)
        }
      })
    }

    // @ts-expect-error — Prisma event typing
    this.$on('error', (e: { message: string }) => {
      this.logger.error(`Prisma error: ${e.message}`)
    })
  }

  async onModuleInit(): Promise<void> {
    await this.$connect()
    this.logger.log('Database connected')
  }

  async onModuleDestroy(): Promise<void> {
    await this.$disconnect()
    this.logger.log('Database disconnected')
  }

  /**
   * Enable soft-delete filtering — excludes records with deletedAt set.
   * Usage: this.prisma.withSoftDelete().user.findMany(...)
   */
  withSoftDelete(): this {
    return this.$extends({
      query: {
        $allModels: {
          async findMany({ args, query }: { args: Record<string, unknown>; query: (args: Record<string, unknown>) => unknown }) {
            args['where'] = { ...((args['where'] as Record<string, unknown> | undefined) ?? {}), deletedAt: null }
            return query(args)
          },
          async findFirst({ args, query }: { args: Record<string, unknown>; query: (args: Record<string, unknown>) => unknown }) {
            args['where'] = { ...((args['where'] as Record<string, unknown> | undefined) ?? {}), deletedAt: null }
            return query(args)
          },
          async findUnique({ args, query }: { args: Record<string, unknown>; query: (args: Record<string, unknown>) => unknown }) {
            args['where'] = { ...((args['where'] as Record<string, unknown> | undefined) ?? {}), deletedAt: null }
            return query(args)
          },
        },
      },
    }) as this
  }

  /**
   * Execute a function within a transaction, retrying on deadlock.
   */
  async withRetry<T>(
    fn: () => Promise<T>,
    maxRetries = 3,
  ): Promise<T> {
    let lastError: unknown
    for (let i = 0; i < maxRetries; i++) {
      try {
        return await fn()
      } catch (error) {
        lastError = error
        const isDeadlock =
          error instanceof Error &&
          (error.message.includes('deadlock') ||
            error.message.includes('P2034'))
        if (!isDeadlock) {
          throw error
        }
        this.logger.warn(`Transaction deadlock, retry ${i + 1}/${maxRetries}`)
        await new Promise((r) => setTimeout(r, Math.pow(2, i) * 100))
      }
    }
    throw lastError
  }
}
