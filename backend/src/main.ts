import { NestFactory } from '@nestjs/core'
import { ValidationPipe, Logger } from '@nestjs/common'
import { AppModule } from './app.module'
import * as Sentry from '@sentry/node'
import helmet from 'helmet'
import * as compression from 'compression'

async function bootstrap() {
  const logger = new Logger('Bootstrap')
  const app = await NestFactory.create(AppModule, {
    logger: ['log', 'warn', 'error', 'debug'],
  })

  // Security
  app.use(helmet())
  app.use(compression())

  // CORS
  app.enableCors({
    origin: [
      'https://ayushman.world',
      'http://localhost:3000',
      'http://localhost:3001',
    ],
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    credentials: true,
  })

  // Global prefix
  app.setGlobalPrefix('api/v1')

  // Validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  )

  // Sentry
  if (process.env.SENTRY_DSN) {
    Sentry.init({ dsn: process.env.SENTRY_DSN, environment: process.env.NODE_ENV })
  }

  const port = process.env.PORT || 4000
  await app.listen(port)
  logger.log(`🚀 Ayushman API running on http://localhost:${port}/api/v1`)
  logger.log(`📊 Environment: ${process.env.NODE_ENV}`)
}
bootstrap()
