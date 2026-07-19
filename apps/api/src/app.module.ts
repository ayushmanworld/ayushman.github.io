import { Module } from '@nestjs/common'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { ThrottlerModule } from '@nestjs/throttler'
import { EventEmitterModule } from '@nestjs/event-emitter'
import { ScheduleModule } from '@nestjs/schedule'
import { BullModule } from '@nestjs/bull'
import { CacheModule } from '@nestjs/cache-manager'
import { redisStore } from 'cache-manager-ioredis-yet'
import { HealthModule } from './health/health.module'
import { environmentValidation } from './config/environment.validation'

/**
 * AppModule — Root application module.
 *
 * Domain feature modules are imported here as they are implemented in
 * subsequent phases. Phase 0 only bootstraps the infrastructure layer.
 */
@Module({
  imports: [
    // ─── Configuration ──────────────────────────────
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env.local', '.env'],
      validate: environmentValidation,
      expandVariables: true,
    }),

    // ─── Rate Limiting ──────────────────────────────
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

    // ─── Cache (Redis) ──────────────────────────────
    CacheModule.registerAsync({
      isGlobal: true,
      inject: [ConfigService],
      useFactory: async (config: ConfigService) => ({
        store: await redisStore({
          socket: { host: new URL(config.get<string>('REDIS_URL', 'redis://localhost:6379')).hostname },
          password: config.get<string>('REDIS_PASSWORD'),
          ttl: config.get<number>('REDIS_TTL_DEFAULT', 300) * 1000,
        }),
      }),
    }),

    // ─── Queue (BullMQ via Bull) ────────────────────
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

    // ─── Events ─────────────────────────────────────
    EventEmitterModule.forRoot({
      wildcard: true,
      delimiter: '.',
      maxListeners: 20,
      verboseMemoryLeak: true,
    }),

    // ─── Scheduling ─────────────────────────────────
    ScheduleModule.forRoot(),

    // ─── Feature Modules (added per phase) ──────────
    HealthModule,

    // Phase 1: AuthModule, UsersModule, PrismaModule
    // Phase 3: ParentDashboardModule
    // Phase 4: ChildrenModule
    // Phase 5: TherapyModule
    // Phase 6: ResourcesModule, VideosModule
    // Phase 7: AiModule
    // Phase 8: PartnersModule
    // Phase 9: DonationsModule
    // Phase 10: AnalyticsModule
    // Phase 11: AdminModule, CmsModule
  ],
})
export class AppModule {}
