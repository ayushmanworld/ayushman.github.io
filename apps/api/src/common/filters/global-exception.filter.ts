import {
  type ExceptionFilter,
  Catch,
  type ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common'
import { type Request, type Response } from 'express'
import { Prisma } from '@prisma/client'
import * as Sentry from '@sentry/node'

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(GlobalExceptionFilter.name)

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp()
    const response = ctx.getResponse<Response>()
    const request = ctx.getRequest<Request>()

    let status = HttpStatus.INTERNAL_SERVER_ERROR
    let message = 'Internal server error'
    let code = 'INTERNAL_ERROR'
    let details: Record<string, unknown> | undefined

    // HTTP exceptions (NestJS built-ins)
    if (exception instanceof HttpException) {
      status = exception.getStatus()
      const exceptionResponse = exception.getResponse()

      if (typeof exceptionResponse === 'string') {
        message = exceptionResponse
      } else if (typeof exceptionResponse === 'object' && exceptionResponse !== null) {
        const resp = exceptionResponse as Record<string, unknown>
        message = typeof resp['message'] === 'string'
          ? resp['message']
          : Array.isArray(resp['message'])
            ? (resp['message'] as string[]).join(', ')
            : message
        code = typeof resp['error'] === 'string' ? resp['error'].toUpperCase().replace(/\s/g, '_') : this.statusToCode(status)
      }
    }
    // Prisma known errors
    else if (exception instanceof Prisma.PrismaClientKnownRequestError) {
      switch (exception.code) {
        case 'P2002':
          status = HttpStatus.CONFLICT
          message = 'A record with this value already exists'
          code = 'DUPLICATE_ENTRY'
          details = { fields: exception.meta?.['target'] }
          break
        case 'P2025':
          status = HttpStatus.NOT_FOUND
          message = 'Record not found'
          code = 'NOT_FOUND'
          break
        case 'P2003':
          status = HttpStatus.BAD_REQUEST
          message = 'Invalid reference — related record not found'
          code = 'INVALID_REFERENCE'
          break
        default:
          status = HttpStatus.INTERNAL_SERVER_ERROR
          code = 'DATABASE_ERROR'
          this.logger.error(`Prisma error ${exception.code}: ${exception.message}`)
      }
    }
    // Prisma validation errors
    else if (exception instanceof Prisma.PrismaClientValidationError) {
      status = HttpStatus.BAD_REQUEST
      message = 'Invalid data provided'
      code = 'VALIDATION_ERROR'
    }
    // Unknown errors — capture with Sentry
    else {
      this.logger.error(
        `Unhandled exception on ${request.method} ${request.url}`,
        exception instanceof Error ? exception.stack : String(exception),
      )
      Sentry.captureException(exception)
    }

    const body = {
      success: false,
      error: {
        code,
        message,
        ...(details !== undefined && { details }),
      },
      path: request.url,
      method: request.method,
      timestamp: new Date().toISOString(),
    }

    response.status(status).json(body)
  }

  private statusToCode(status: number): string {
    const map: Record<number, string> = {
      400: 'BAD_REQUEST',
      401: 'UNAUTHORIZED',
      403: 'FORBIDDEN',
      404: 'NOT_FOUND',
      409: 'CONFLICT',
      422: 'UNPROCESSABLE_ENTITY',
      429: 'TOO_MANY_REQUESTS',
      500: 'INTERNAL_ERROR',
    }
    return map[status] ?? 'ERROR'
  }
}
