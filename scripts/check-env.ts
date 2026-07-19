#!/usr/bin/env ts-node
/**
 * Environment Variable Validation Script
 * Verifies all required variables are set before application startup.
 * Run: pnpm check-env
 */

import * as fs from 'fs'
import * as path from 'path'

interface EnvVar {
  key: string
  required: boolean
  description: string
  validator?: (value: string) => boolean
}

const ENV_VARS: EnvVar[] = [
  // Database
  { key: 'DATABASE_URL', required: true, description: 'PostgreSQL connection string', validator: (v) => v.startsWith('postgresql://') },
  // Redis
  { key: 'REDIS_URL', required: true, description: 'Redis connection string', validator: (v) => v.startsWith('redis://') },
  // JWT
  { key: 'JWT_ACCESS_SECRET', required: true, description: 'JWT access token secret (min 32 chars)', validator: (v) => v.length >= 32 },
  { key: 'JWT_REFRESH_SECRET', required: true, description: 'JWT refresh token secret (min 32 chars)', validator: (v) => v.length >= 32 },
  // AI
  { key: 'ANTHROPIC_API_KEY', required: false, description: 'Anthropic Claude API key', validator: (v) => v.startsWith('sk-ant-') },
  { key: 'OPENAI_API_KEY', required: false, description: 'OpenAI API key for embeddings', validator: (v) => v.startsWith('sk-') },
  // Payments
  { key: 'RAZORPAY_KEY_ID', required: false, description: 'Razorpay key ID' },
  { key: 'RAZORPAY_KEY_SECRET', required: false, description: 'Razorpay key secret' },
  // Email
  { key: 'RESEND_API_KEY', required: false, description: 'Resend API key' },
  // Search
  { key: 'MEILISEARCH_HOST', required: true, description: 'Meilisearch host URL' },
  // Frontend
  { key: 'NEXT_PUBLIC_APP_URL', required: true, description: 'Public URL of the web app' },
  { key: 'NEXT_PUBLIC_API_URL', required: true, description: 'Public URL of the API' },
]

function loadEnvFile(): void {
  const envPath = path.join(process.cwd(), '.env')
  if (fs.existsSync(envPath)) {
    const content = fs.readFileSync(envPath, 'utf-8')
    for (const line of content.split('\n')) {
      const trimmed = line.trim()
      if (trimmed && !trimmed.startsWith('#')) {
        const [key, ...valueParts] = trimmed.split('=')
        const value = valueParts.join('=').replace(/^["']|["']$/g, '')
        if (key && !(key in process.env)) {
          process.env[key] = value
        }
      }
    }
  }
}

function checkEnv(): void {
  loadEnvFile()

  const errors: string[] = []
  const warnings: string[] = []
  const ok: string[] = []

  for (const envVar of ENV_VARS) {
    const value = process.env[envVar.key]

    if (!value || value.includes('REPLACE') || value.includes('CHANGE_ME')) {
      if (envVar.required) {
        errors.push(`${envVar.key}: ${envVar.description}`)
      } else {
        warnings.push(`${envVar.key}: ${envVar.description} (optional)`)
      }
      continue
    }

    if (envVar.validator && !envVar.validator(value)) {
      errors.push(`${envVar.key}: Invalid format — ${envVar.description}`)
      continue
    }

    ok.push(envVar.key)
  }

  console.log('\n🔍 Environment Variable Check\n' + '─'.repeat(50))

  if (ok.length > 0) {
    console.log(`\n✅ Valid (${ok.length}):`)
    for (const key of ok) {
      console.log(`   ${key}`)
    }
  }

  if (warnings.length > 0) {
    console.log(`\n⚠️  Missing optional (${warnings.length}):`)
    for (const warning of warnings) {
      console.log(`   ${warning}`)
    }
  }

  if (errors.length > 0) {
    console.log(`\n❌ Missing required (${errors.length}):`)
    for (const error of errors) {
      console.log(`   ${error}`)
    }
    console.log('\n📖 See .env.example for documentation.\n')
    process.exit(1)
  }

  console.log('\n✅ All required environment variables are set.\n')
}

checkEnv()
