import { Injectable, UnauthorizedException } from '@nestjs/common'
import { PassportStrategy } from '@nestjs/passport'
import { ExtractJwt, Strategy } from 'passport-jwt'
import { ConfigService } from '@nestjs/config'
import { PrismaService } from '../../prisma/prisma.service'
import type { Request } from 'express'

interface JwtRefreshPayload {
  sub: string
  email: string
  role: string
  iat: number
  exp: number
}

@Injectable()
export class JwtRefreshStrategy extends PassportStrategy(Strategy, 'jwt-refresh') {
  constructor(
    config: ConfigService,
    private readonly prisma: PrismaService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromBodyField('refreshToken'),
      ignoreExpiration: false,
      secretOrKey: config.get<string>('JWT_REFRESH_SECRET'),
      passReqToCallback: true,
    })
  }

  async validate(
    req: Request,
    payload: JwtRefreshPayload,
  ): Promise<{ id: string; refreshToken: string }> {
    const body = req.body as Record<string, unknown>
    const refreshToken = body['refreshToken'] as string | undefined

    if (refreshToken === undefined || refreshToken === '') {
      throw new UnauthorizedException('Refresh token missing')
    }

    // Verify the session exists and is not revoked
    const session = await this.prisma.userSession.findUnique({
      where: { refreshToken },
      include: { user: { select: { id: true, status: true } } },
    })

    if (session === null || session.isRevoked) {
      throw new UnauthorizedException('Invalid refresh token')
    }

    if (session.expiresAt < new Date()) {
      throw new UnauthorizedException('Refresh token expired')
    }

    if (session.user.status === 'SUSPENDED' || session.user.status === 'DELETED') {
      throw new UnauthorizedException('Account is inactive')
    }

    if (session.userId !== payload.sub) {
      throw new UnauthorizedException('Token mismatch')
    }

    return { id: payload.sub, refreshToken }
  }
}
