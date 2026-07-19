import { z } from 'zod'

const environmentSchema = z.object({
  NODE_ENV: z.enum(['development', 'staging', 'production', 'test']).default('development'),
  API_PORT: z.coerce.number().int().positive().default(4000),
  API_PREFIX: z.string().default('api/v1'),
  API_CORS_ORIGINS: z.string().default('http://localhost:3000'),
  API_RATE_LIMIT_MAX: z.coerce.number().int().positive().default(100),
  API_THROTTLE_SHORT_TTL: z.coerce.number().int().positive().default(1000),
  API_THROTTLE_SHORT_LIMIT: z.coerce.number().int().positive().default(10),
  API_THROTTLE_MEDIUM_TTL: z.coerce.number().int().positive().default(10_000),
  API_THROTTLE_MEDIUM_LIMIT: z.coerce.number().int().positive().default(50),

  DATABASE_URL: z.string().url(),
  DATABASE_POOL_MIN: z.coerce.number().int().nonnegative().default(2),
  DATABASE_POOL_MAX: z.coerce.number().int().positive().default(10),

  REDIS_URL: z.string().url().default('redis://localhost:6379'),
  REDIS_PASSWORD: z.string().optional(),
  REDIS_TTL_DEFAULT: z.coerce.number().int().positive().default(300),
  REDIS_TTL_SESSION: z.coerce.number().int().positive().default(604_800),

  JWT_ACCESS_SECRET: z.string().min(32),
  JWT_REFRESH_SECRET: z.string().min(32),
  JWT_ACCESS_EXPIRES_IN: z.string().default('15m'),
  JWT_REFRESH_EXPIRES_IN: z.string().default('7d'),
  JWT_ISSUER: z.string().default('ayushman-api'),
  JWT_AUDIENCE: z.string().default('ayushman-platform'),

  ANTHROPIC_API_KEY: z.string().startsWith('sk-ant-').optional(),
  ANTHROPIC_MODEL: z.string().default('claude-sonnet-4-6'),
  ANTHROPIC_MAX_TOKENS: z.coerce.number().int().positive().default(2048),

  OPENAI_API_KEY: z.string().startsWith('sk-').optional(),
  OPENAI_EMBEDDING_MODEL: z.string().default('text-embedding-3-small'),
  OPENAI_EMBEDDING_DIMENSIONS: z.coerce.number().int().positive().default(1536),

  RAZORPAY_KEY_ID: z.string().optional(),
  RAZORPAY_KEY_SECRET: z.string().optional(),

  RESEND_API_KEY: z.string().optional(),
  RESEND_FROM_EMAIL: z.string().email().default('noreply@ayushman.world'),
  RESEND_FROM_NAME: z.string().default('Ayushman'),

  MEILISEARCH_HOST: z.string().url().default('http://localhost:7700'),
  MEILISEARCH_MASTER_KEY: z.string().optional(),

  AWS_REGION: z.string().default('ap-south-1'),
  AWS_ACCESS_KEY_ID: z.string().optional(),
  AWS_SECRET_ACCESS_KEY: z.string().optional(),
  AWS_S3_BUCKET: z.string().optional(),

  SENTRY_DSN: z.string().url().optional(),
})

export type EnvironmentVariables = z.infer<typeof environmentSchema>

export function environmentValidation(
  config: Record<string, unknown>,
): EnvironmentVariables {
  const result = environmentSchema.safeParse(config)

  if (!result.success) {
    const formatted = result.error.errors
      .map((e) => `  ${e.path.join('.')}: ${e.message}`)
      .join('\n')
    throw new Error(`❌ Invalid environment variables:\n${formatted}`)
  }

  return result.data
}
