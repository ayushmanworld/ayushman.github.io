import {
  Injectable,
  Logger,
  ConflictException,
  UnauthorizedException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { ConfigService } from '@nestjs/config'
import { PrismaService } from '../prisma/prisma.service'
import { AuditService } from '../audit/audit.service'
import { EmailService } from '../email/email.service'
import * as bcrypt from 'bcrypt'
import { randomBytes } from 'crypto'
import type {
  RegisterDto,
  LoginDto,
  ForgotPasswordDto,
  ResetPasswordDto,
  VerifyEmailDto,
  ChangePasswordDto,
} from './dto/auth.dto'
import type { AuthUser, TokenPair } from '@ayushman/types'
import type { UserRole } from '@prisma/client'

const BCRYPT_ROUNDS = 12
const VERIFICATION_TOKEN_EXPIRY_HOURS = 24
const RESET_TOKEN_EXPIRY_HOURS = 1
const MAX_LOGIN_ATTEMPTS = 5
const LOCKOUT_MINUTES = 15

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name)

  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
    private readonly config: ConfigService,
    private readonly audit: AuditService,
    private readonly email: EmailService,
  ) {}

  // ─────────────────────────────────────────────────
  // Registration
  // ─────────────────────────────────────────────────

  async register(
    dto: RegisterDto,
    ipAddress?: string,
  ): Promise<{ user: AuthUser; tokens: TokenPair }> {
    // Check for existing user
    const existing = await this.prisma.user.findUnique({
      where: { email: dto.email },
      select: { id: true },
    })

    if (existing !== null) {
      throw new ConflictException('An account with this email already exists')
    }

    // Check phone uniqueness if provided
    if (dto.phone !== undefined && dto.phone !== '') {
      const existingPhone = await this.prisma.user.findUnique({
        where: { phone: dto.phone },
        select: { id: true },
      })
      if (existingPhone !== null) {
        throw new ConflictException('An account with this phone number already exists')
      }
    }

    const passwordHash = await bcrypt.hash(dto.password, BCRYPT_ROUNDS)

    const user = await this.prisma.user.create({
      data: {
        name: dto.name,
        email: dto.email,
        phone: dto.phone,
        passwordHash,
        role: (dto.role as UserRole) ?? 'PARENT',
        status: 'PENDING_VERIFICATION',
        isEmailVerified: false,
      },
      select: {
        id: true, email: true, name: true,
        role: true, isEmailVerified: true, avatarUrl: true,
      },
    })

    // Create email verification token
    const verificationToken = randomBytes(32).toString('hex')
    const expiresAt = new Date()
    expiresAt.setHours(expiresAt.getHours() + VERIFICATION_TOKEN_EXPIRY_HOURS)

    await this.prisma.emailVerification.create({
      data: {
        email: user.email,
        token: verificationToken,
        expiresAt,
      },
    })

    // Send emails (non-blocking)
    void this.email.sendWelcome({ to: user.email, name: user.name })
    void this.email.sendEmailVerification({
      to: user.email,
      name: user.name,
      token: verificationToken,
    })

    // Audit log
    await this.audit.logCreate({
      actorId: user.id,
      entityType: 'User',
      entityId: user.id,
      data: { email: user.email, role: user.role },
      ipAddress,
    })

    this.logger.log(`New user registered: ${user.email} (${user.role})`)

    const authUser: AuthUser = {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role as AuthUser['role'],
      isVerified: user.isEmailVerified,
      avatarUrl: user.avatarUrl ?? undefined,
    }

    const tokens = await this.generateTokens(authUser)

    return { user: authUser, tokens }
  }

  // ─────────────────────────────────────────────────
  // Login
  // ─────────────────────────────────────────────────

  async login(
    user: AuthUser,
    ipAddress?: string,
    userAgent?: string,
  ): Promise<{ user: AuthUser; tokens: TokenPair }> {
    const tokens = await this.generateTokens(user)

    // Update last login
    await this.prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date(), loginAttempts: 0, lockedUntil: null },
    })

    await this.audit.logLogin({ actorId: user.id, ipAddress, userAgent, success: true })

    return { user, tokens }
  }

  // ─────────────────────────────────────────────────
  // Credential Validation (for LocalStrategy)
  // ─────────────────────────────────────────────────

  async validateCredentials(
    email: string,
    password: string,
  ): Promise<AuthUser | null> {
    const user = await this.prisma.user.findUnique({
      where: { email: email.toLowerCase() },
      select: {
        id: true, email: true, name: true, role: true,
        status: true, isEmailVerified: true, avatarUrl: true,
        passwordHash: true, loginAttempts: true, lockedUntil: true,
      },
    })

    if (user === null) {
      // Constant-time comparison to prevent timing attacks
      await bcrypt.compare(password, '$2b$12$placeholder.hash.to.prevent.timing.attacks')
      return null
    }

    // Check lockout
    if (user.lockedUntil !== null && user.lockedUntil > new Date()) {
      throw new UnauthorizedException(
        `Account locked due to too many failed attempts. Try again after ${user.lockedUntil.toLocaleTimeString('en-IN')}`,
      )
    }

    if (user.status === 'SUSPENDED' || user.status === 'DELETED') {
      throw new UnauthorizedException('Account is suspended or deleted')
    }

    if (user.passwordHash === null) {
      return null
    }

    const passwordValid = await bcrypt.compare(password, user.passwordHash)

    if (!passwordValid) {
      const attempts = user.loginAttempts + 1
      const lockedUntil =
        attempts >= MAX_LOGIN_ATTEMPTS
          ? new Date(Date.now() + LOCKOUT_MINUTES * 60 * 1000)
          : null

      await this.prisma.user.update({
        where: { id: user.id },
        data: { loginAttempts: attempts, lockedUntil },
      })

      if (lockedUntil !== null) {
        throw new UnauthorizedException(
          `Too many failed attempts. Account locked for ${LOCKOUT_MINUTES} minutes.`,
        )
      }

      return null
    }

    // Reset login attempts on success
    if (user.loginAttempts > 0) {
      await this.prisma.user.update({
        where: { id: user.id },
        data: { loginAttempts: 0, lockedUntil: null },
      })
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

  // ─────────────────────────────────────────────────
  // Refresh Tokens
  // ─────────────────────────────────────────────────

  async refreshTokens(
    userId: string,
    oldRefreshToken: string,
  ): Promise<TokenPair> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, email: true, name: true, role: true, isEmailVerified: true, avatarUrl: true, status: true },
    })

    if (user === null || user.status === 'SUSPENDED' || user.status === 'DELETED') {
      throw new UnauthorizedException('Account inactive')
    }

    // Revoke old session
    await this.prisma.userSession.updateMany({
      where: { refreshToken: oldRefreshToken },
      data: { isRevoked: true },
    })

    const authUser: AuthUser = {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role as AuthUser['role'],
      isVerified: user.isEmailVerified,
      avatarUrl: user.avatarUrl ?? undefined,
    }

    return this.generateTokens(authUser)
  }

  // ─────────────────────────────────────────────────
  // Logout
  // ─────────────────────────────────────────────────

  async logout(refreshToken: string, userId: string): Promise<void> {
    await this.prisma.userSession.updateMany({
      where: { userId, refreshToken },
      data: { isRevoked: true },
    })

    await this.audit.log({
      actorId: userId,
      action: 'LOGOUT',
      entityType: 'User',
      entityId: userId,
    })
  }

  async logoutAll(userId: string): Promise<void> {
    await this.prisma.userSession.updateMany({
      where: { userId, isRevoked: false },
      data: { isRevoked: true },
    })
  }

  // ─────────────────────────────────────────────────
  // Email Verification
  // ─────────────────────────────────────────────────

  async verifyEmail(dto: VerifyEmailDto): Promise<void> {
    const verification = await this.prisma.emailVerification.findUnique({
      where: { token: dto.token },
    })

    if (verification === null) {
      throw new BadRequestException('Invalid verification token')
    }

    if (verification.usedAt !== null) {
      throw new BadRequestException('Verification token already used')
    }

    if (verification.expiresAt < new Date()) {
      throw new BadRequestException('Verification token has expired. Please request a new one.')
    }

    await this.prisma.$transaction([
      this.prisma.emailVerification.update({
        where: { token: dto.token },
        data: { usedAt: new Date() },
      }),
      this.prisma.user.updateMany({
        where: { email: verification.email },
        data: { isEmailVerified: true, status: 'ACTIVE' },
      }),
    ])

    this.logger.log(`Email verified: ${verification.email}`)
  }

  async resendVerificationEmail(userId: string): Promise<void> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { email: true, name: true, isEmailVerified: true },
    })

    if (user === null) {
      throw new NotFoundException('User not found')
    }

    if (user.isEmailVerified) {
      throw new BadRequestException('Email is already verified')
    }

    // Invalidate existing tokens
    await this.prisma.emailVerification.updateMany({
      where: { email: user.email, usedAt: null },
      data: { usedAt: new Date() },
    })

    const token = randomBytes(32).toString('hex')
    const expiresAt = new Date()
    expiresAt.setHours(expiresAt.getHours() + VERIFICATION_TOKEN_EXPIRY_HOURS)

    await this.prisma.emailVerification.create({
      data: { email: user.email, token, expiresAt },
    })

    void this.email.sendEmailVerification({ to: user.email, name: user.name, token })
  }

  // ─────────────────────────────────────────────────
  // Password Reset
  // ─────────────────────────────────────────────────

  async forgotPassword(dto: ForgotPasswordDto): Promise<void> {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
      select: { id: true, name: true, email: true },
    })

    // Always return success to prevent email enumeration
    if (user === null) {
      this.logger.debug(`Password reset requested for non-existent email: ${dto.email}`)
      return
    }

    const token = randomBytes(32).toString('hex')
    const expiresAt = new Date()
    expiresAt.setHours(expiresAt.getHours() + RESET_TOKEN_EXPIRY_HOURS)

    await this.prisma.passwordReset.create({
      data: { userId: user.id, token, expiresAt },
    })

    void this.email.sendPasswordReset({ to: user.email, name: user.name, token })
  }

  async resetPassword(dto: ResetPasswordDto): Promise<void> {
    const reset = await this.prisma.passwordReset.findUnique({
      where: { token: dto.token },
      include: { },
    })

    if (reset === null) {
      throw new BadRequestException('Invalid or expired reset token')
    }

    if (reset.usedAt !== null) {
      throw new BadRequestException('Reset token has already been used')
    }

    if (reset.expiresAt < new Date()) {
      throw new BadRequestException('Reset token has expired. Please request a new one.')
    }

    const passwordHash = await bcrypt.hash(dto.password, BCRYPT_ROUNDS)

    await this.prisma.$transaction([
      this.prisma.passwordReset.update({
        where: { token: dto.token },
        data: { usedAt: new Date() },
      }),
      this.prisma.user.update({
        where: { id: reset.userId },
        data: {
          passwordHash,
          passwordChangedAt: new Date(),
          loginAttempts: 0,
          lockedUntil: null,
        },
      }),
      // Revoke all sessions after password change
      this.prisma.userSession.updateMany({
        where: { userId: reset.userId, isRevoked: false },
        data: { isRevoked: true },
      }),
    ])

    this.logger.log(`Password reset successful for user: ${reset.userId}`)
  }

  // ─────────────────────────────────────────────────
  // Change Password (authenticated)
  // ─────────────────────────────────────────────────

  async changePassword(
    userId: string,
    dto: ChangePasswordDto,
  ): Promise<void> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { passwordHash: true },
    })

    if (user === null || user.passwordHash === null) {
      throw new NotFoundException('User not found')
    }

    const currentValid = await bcrypt.compare(dto.currentPassword, user.passwordHash)
    if (!currentValid) {
      throw new UnauthorizedException('Current password is incorrect')
    }

    const newHash = await bcrypt.hash(dto.newPassword, BCRYPT_ROUNDS)

    await this.prisma.$transaction([
      this.prisma.user.update({
        where: { id: userId },
        data: { passwordHash: newHash, passwordChangedAt: new Date() },
      }),
      this.prisma.userSession.updateMany({
        where: { userId, isRevoked: false },
        data: { isRevoked: true },
      }),
    ])
  }

  // ─────────────────────────────────────────────────
  // Token Generation
  // ─────────────────────────────────────────────────

  private async generateTokens(user: AuthUser): Promise<TokenPair> {
    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role,
    }

    const [accessToken, refreshToken] = await Promise.all([
      this.jwt.signAsync(payload, {
        secret: this.config.get<string>('JWT_ACCESS_SECRET'),
        expiresIn: this.config.get<string>('JWT_ACCESS_EXPIRES_IN', '15m'),
        issuer: this.config.get<string>('JWT_ISSUER', 'ayushman-api'),
        audience: this.config.get<string>('JWT_AUDIENCE', 'ayushman-platform'),
      }),
      this.jwt.signAsync(payload, {
        secret: this.config.get<string>('JWT_REFRESH_SECRET'),
        expiresIn: this.config.get<string>('JWT_REFRESH_EXPIRES_IN', '7d'),
      }),
    ])

    // Store refresh token session
    const refreshExpiresInDays = 7
    const expiresAt = new Date()
    expiresAt.setDate(expiresAt.getDate() + refreshExpiresInDays)

    await this.prisma.userSession.create({
      data: {
        userId: user.id,
        refreshToken,
        expiresAt,
      },
    })

    // Clean up expired sessions (non-blocking)
    void this.prisma.userSession.deleteMany({
      where: {
        userId: user.id,
        OR: [{ expiresAt: { lt: new Date() } }, { isRevoked: true }],
      },
    })

    return {
      accessToken,
      refreshToken,
      expiresIn: 15 * 60, // 15 minutes in seconds
    }
  }
}
