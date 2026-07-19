import { Module } from '@nestjs/common'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { ThrottlerModule } from '@nestjs/throttler'
import { EventEmitterModule } from '@nestjs/event-emitter'
import { ScheduleModule } from '@nestjs/schedule'
import { BullModule } from '@nestjs/bull'
import { CacheModule } from '@nestjs/cache-manager'
import { redisStore } from 'cache-manager-ioredis-yet'
import { APP_GUARD, APP_FILTER, APP_INTERCEPTOR } from '@nestjs/core'

import { PrismaModule } from './prisma/prisma.module'
import { RbacModule } from './rbac/rbac.module'
import { AuditModule } from './audit/audit.module'
import { EmailModule } from './email/email.module'
import { AuthModule } from './auth/auth.module'
import { UsersModule } from './users/users.module'
import { HealthModule } from './health/health.module'
import { environmentValidation } from './config/environment.validation'
import { GlobalExceptionFilter } from './common/filters/global-exception.filter'
import { ResponseInterceptor } from './common/interceptors/response.interceptor'
import { JwtAuthGuard } from './auth/guards/auth.guards'
import { RolesGuard } from './auth/guards/auth.guards'
import { PermissionsGuard } from './auth/guards/auth.guards'

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env.local', '.env'],
      validate: environmentValidation,
      expandVariables: true,
    }),

    ThrottlerModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        throttlers: [
          {
            name: 'short',
            ttl: config.get<number>('API_THROTTLE_SHORT_TTL', 1000),
            limit: config.get<number>('API_THROTTLE_SHORT_LIMIT', 10),
          },
          {
            name: 'medium',
            ttl: config.get<number>('API_THROTTLE_MEDIUM_TTL', 10_000),
            limit: config.get<number>('API_THROTTLE_MEDIUM_LIMIT', 50),
          },
          {
            name: 'long',
            ttl: 60_000,
            limit: config.get<number>('API_RATE_LIMIT_MAX', 100),
          },
        ],
      }),
    }),

    CacheModule.registerAsync({
      isGlobal: true,
      inject: [ConfigService],
      useFactory: async (config: ConfigService) => ({
        store: await redisStore({
          socket: {
            host: new URL(config.get<string>('REDIS_URL', 'redis://localhost:6379')).hostname,
          },
          password: config.get<string>('REDIS_PASSWORD'),
          ttl: config.get<number>('REDIS_TTL_DEFAULT', 300) * 1000,
        }),
      }),
    }),

    BullModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        redis: {
          host: new URL(config.get<string>('REDIS_URL', 'redis://localhost:6379')).hostname,
          port: 6379,
          password: config.get<string>('REDIS_PASSWORD'),
        },
        defaultJobOptions: {
          removeOnComplete: 100,
          removeOnFail: 50,
          attempts: 3,
          backoff: { type: 'exponential', delay: 2000 },
        },
      }),
    }),

    EventEmitterModule.forRoot({
      wildcard: true,
      delimiter: '.',
      maxListeners: 20,
      verboseMemoryLeak: true,
    }),

    ScheduleModule.forRoot(),

    // Core infrastructure (global)
    PrismaModule,
    RbacModule,
    AuditModule,
    EmailModule,

    // Phase 1: Auth + Users
    AuthModule,
    UsersModule,

    // Utilities
    HealthModule,

    // Phase 2+: feature modules added per phase
  ],
  providers: [
    // Global exception handler
    { provide: APP_FILTER, useClass: GlobalExceptionFilter },

    // Global response envelope
    { provide: APP_INTERCEPTOR, useClass: ResponseInterceptor },

    // Global guards (JWT first, then roles, then permissions)
    { provide: APP_GUARD, useClass: JwtAuthGuard },
    { provide: APP_GUARD, useClass: RolesGuard },
    { provide: APP_GUARD, useClass: PermissionsGuard },
  ],
})
export class AppModule {}
