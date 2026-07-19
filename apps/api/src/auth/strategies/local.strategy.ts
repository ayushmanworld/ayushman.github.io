import { Injectable, UnauthorizedException } from '@nestjs/common'
import { PassportStrategy } from '@nestjs/passport'
import { Strategy } from 'passport-local'
import { AuthService } from '../auth.service'
import type { AuthUser } from '@ayushman/types'

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy, 'local') {
  constructor(private readonly authService: AuthService) {
    super({ usernameField: 'email', passwordField: 'password' })
  }

  async validate(email: string, password: string): Promise<AuthUser> {
    const user = await this.authService.validateCredentials(email, password)
    if (user === null) {
      throw new UnauthorizedException('Invalid email or password')
    }
    return user
  }
}
