import { Injectable, UnauthorizedException } from '@nestjs/common'
import { PassportStrategy } from '@nestjs/passport'
import { ExtractJwt, Strategy } from 'passport-jwt'
import { ConfigService } from '@nestjs/config'
import { PrismaService } from '../../prisma/prisma.service'
import type { AuthUser } from '@ayushman/types'

interface JwtPayload {
  sub: string
  email: string
  role: string
  iat: number
  exp: number
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(
    config: ConfigService,
    private readonly prisma: PrismaService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: config.get<string>('JWT_ACCESS_SECRET'),
      issuer: config.get<string>('JWT_ISSUER', 'ayushman-api'),
      audience: config.get<string>('JWT_AUDIENCE', 'ayushman-platform'),
    })
  }

  async validate(payload: JwtPayload): Promise<AuthUser> {
    const user = await this.prisma.user.findUnique({
      where: { id: payload.sub },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        status: true,
        isEmailVerified: true,
        avatarUrl: true,
      },
    })

    if (user === null) {
      throw new UnauthorizedException('User not found')
    }

    if (user.status !== 'ACTIVE' && user.status !== 'PENDING_VERIFICATION') {
      throw new UnauthorizedException('Account is suspended or inactive')
    }

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role as AuthUser['role'],
      isVerified: user.isEmailVerified,
      avatarUrl: user.avatarUrl ?? undefined,
    }
  }
}
