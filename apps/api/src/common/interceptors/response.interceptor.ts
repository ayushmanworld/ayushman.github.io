import {
  Injectable,
  type NestInterceptor,
  type ExecutionContext,
  type CallHandler,
} from '@nestjs/common'
import type { Observable } from 'rxjs'
import { map } from 'rxjs/operators'

interface StandardResponse<T> {
  success: boolean
  data: T
  timestamp: string
}

@Injectable()
export class ResponseInterceptor<T>
  implements NestInterceptor<T, StandardResponse<T>>
{
  intercept(
    _context: ExecutionContext,
    next: CallHandler<T>,
  ): Observable<StandardResponse<T>> {
    return next.handle().pipe(
      map((data) => {
        // If the controller already returns a structured response, pass it through
        if (
          data !== null &&
          typeof data === 'object' &&
          'success' in data &&
          'timestamp' in data
        ) {
          return data as unknown as StandardResponse<T>
        }

        return {
          success: true,
          data,
          timestamp: new Date().toISOString(),
        }
      }),
    )
  }
}
