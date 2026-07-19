import { Module } from '@nestjs/common'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler'
import { CacheModule } from '@nestjs/cache-manager'
import { APP_GUARD } from '@nestjs/core'
import { PrismaModule } from './prisma/prisma.module'
import { AuthModule } from '../auth/auth.module'
import { UsersModule } from '../users/users.module'
import { DonationsModule } from '../modules/donations/donations.module'
import { ChildrenModule } from '../modules/children/children.module'
import { PartnersModule } from '../modules/partners/partners.module'
import { ResourcesModule } from '../modules/resources/resources.module'
import { VideosModule } from '../modules/videos/videos.module'
import { AnalyticsModule } from '../modules/analytics/analytics.module'
import { AIModule } from '../ai/ai.module'

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),

    ThrottlerModule.forRoot([
      { name: 'short', ttl: 1000, limit: 10 },
      { name: 'medium', ttl: 10000, limit: 50 },
      { name: 'long', ttl: 60000, limit: 200 },
    ]),

    CacheModule.registerAsync({
      isGlobal: true,
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        store: 'redis',
        url: config.get('REDIS_URL'),
        ttl: 60 * 5, // 5 minutes default
      }),
    }),

    PrismaModule,
    AuthModule,
    UsersModule,
    DonationsModule,
    ChildrenModule,
    PartnersModule,
    ResourcesModule,
    VideosModule,
    AnalyticsModule,
    AIModule,
  ],
  providers: [
    { provide: APP_GUARD, useClass: ThrottlerGuard },
  ],
})
export class AppModule {}
