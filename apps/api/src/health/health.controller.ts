import { Controller, Get } from '@nestjs/common'
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger'

interface HealthResponse {
  status: 'ok' | 'error'
  timestamp: string
  uptime: number
  version: string
  environment: string
}

/**
 * HealthController
 *
 * Provides liveness and readiness probes used by Docker, Kubernetes,
 * and load balancers to determine service health.
 */
@ApiTags('health')
@Controller('health')
export class HealthController {
  /**
   * Liveness probe — confirms the process is running.
   * Used by Docker HEALTHCHECK and Kubernetes livenessProbe.
   */
  @Get()
  @ApiOperation({ summary: 'Liveness probe', description: 'Returns OK if the API process is running.' })
  @ApiResponse({ status: 200, description: 'API is healthy.' })
  check(): HealthResponse {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: Math.floor(process.uptime()),
      version: process.env['APP_VERSION'] ?? '0.0.0',
      environment: process.env['NODE_ENV'] ?? 'development',
    }
  }

  /**
   * Readiness probe — confirms the application is ready to serve traffic.
   * In Phase 1 this will also check database and Redis connectivity.
   */
  @Get('ready')
  @ApiOperation({ summary: 'Readiness probe', description: 'Returns OK when the API is ready to serve traffic.' })
  @ApiResponse({ status: 200, description: 'API is ready.' })
  @ApiResponse({ status: 503, description: 'API is not ready.' })
  ready(): HealthResponse {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: Math.floor(process.uptime()),
      version: process.env['APP_VERSION'] ?? '0.0.0',
      environment: process.env['NODE_ENV'] ?? 'development',
    }
  }
}
