/**
 * Ayushman API — Application Entry Point
 *
 * Bootstraps the NestJS application with all production middleware:
 * - Security headers (Helmet)
 * - CORS
 * - Rate limiting
 * - Request validation
 * - Swagger documentation
 * - Sentry error monitoring
 * - Graceful shutdown
 */

import 'reflect-metadata'
import { NestFactory, Reflector } from '@nestjs/core'
import { ValidationPipe, ClassSerializerInterceptor, Logger, VersioningType } from '@nestjs/common'
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger'
import { ConfigService } from '@nestjs/config'
import helmet from 'helmet'
import * as compression from 'compression'
import * as cookieParser from 'cookie-parser'
import * as Sentry from '@sentry/nestjs'
import { AppModule } from './app.module'

async function bootstrap(): Promise<void> {
  const logger = new Logger('Bootstrap')

  const app = await NestFactory.create(AppModule, {
    logger: ['log', 'warn', 'error', 'debug', 'verbose'],
    bufferLogs: true,
  })

  const configService = app.get(ConfigService)
  const nodeEnv = configService.get<string>('NODE_ENV', 'development')
  const port = configService.get<number>('API_PORT', 4000)
  const apiPrefix = configService.get<string>('API_PREFIX', 'api/v1')
  const corsOrigins = configService.get<string>('API_CORS_ORIGINS', 'http://localhost:3000')

  // ─── Sentry ──────────────────────────────────────────
  const sentryDsn = configService.get<string>('SENTRY_DSN')
  if (sentryDsn !== undefined && nodeEnv === 'production') {
    Sentry.init({ dsn: sentryDsn, environment: nodeEnv })
  }

  // ─── Security Middleware ─────────────────────────────
  app.use(
    helmet({
      contentSecurityPolicy: nodeEnv === 'production',
      hsts: { maxAge: 63_072_000, includeSubDomains: true, preload: true },
    }),
  )

  // ─── CORS ────────────────────────────────────────────
  app.enableCors({
    origin: corsOrigins.split(',').map((o) => o.trim()),
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    credentials: true,
    maxAge: 86_400,
  })

  // ─── Compression ─────────────────────────────────────
  app.use(compression())

  // ─── Cookie Parser ───────────────────────────────────
  app.use(cookieParser())

  // ─── API Versioning ──────────────────────────────────
  app.setGlobalPrefix(apiPrefix)
  app.enableVersioning({ type: VersioningType.URI })

  // ─── Global Pipes ────────────────────────────────────
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
      stopAtFirstError: false,
    }),
  )

  // ─── Global Interceptors ─────────────────────────────
  const reflector = app.get(Reflector)
  app.useGlobalInterceptors(new ClassSerializerInterceptor(reflector))

  // ─── Swagger ─────────────────────────────────────────
  if (nodeEnv !== 'production') {
    const swaggerConfig = new DocumentBuilder()
      .setTitle('Ayushman API')
      .setDescription(
        'Comprehensive API for the Ayushman AI-Powered Autism Support Platform.\n\n' +
          'Authenticate via the `/auth/login` endpoint and use the returned JWT as a Bearer token.',
      )
      .setVersion('1.0')
      .setContact('Ayushman Support', 'https://ayushman.world', 'support@ayushman.world')
      .setLicense('Proprietary', 'https://ayushman.world/terms')
      .addBearerAuth(
        { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
        'access-token',
      )
      .addServer(`http://localhost:${port}`, 'Local Development')
      .addServer('https://api.ayushman.world', 'Production')
      .addTag('auth', 'Authentication & authorisation')
      .addTag('users', 'User management')
      .addTag('children', 'Child profile management')
      .addTag('resources', 'Resource directory')
      .addTag('partners', 'Partner registration & management')
      .addTag('videos', 'Video library')
      .addTag('donations', 'Donation platform')
      .addTag('ai', 'AI assistant & RAG')
      .addTag('analytics', 'Analytics & reporting')
      .addTag('health', 'Health checks')
      .build()

    const document = SwaggerModule.createDocument(app, swaggerConfig)
    SwaggerModule.setup(`${apiPrefix}/docs`, app, document, {
      swaggerOptions: {
        persistAuthorization: true,
        tagsSorter: 'alpha',
        operationsSorter: 'alpha',
      },
    })
    logger.log(`Swagger docs available at http://localhost:${port}/${apiPrefix}/docs`)
  }

  // ─── Graceful Shutdown ───────────────────────────────
  app.enableShutdownHooks()

  await app.listen(port, '0.0.0.0')
  logger.log(`🚀 Ayushman API running on http://localhost:${port}/${apiPrefix}`)
  logger.log(`🌍 Environment: ${nodeEnv}`)
}

void bootstrap()
