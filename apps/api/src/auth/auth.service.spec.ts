import { Test, type TestingModule } from '@nestjs/testing'
import { ConflictException, UnauthorizedException } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { ConfigService } from '@nestjs/config'
import { AuthService } from './auth.service'
import { PrismaService } from '../prisma/prisma.service'
import { AuditService } from '../audit/audit.service'
import { EmailService } from '../email/email.service'
import * as bcrypt from 'bcrypt'

// ─── Mocks ───────────────────────────────────────

const mockUser = {
  id: 'user-uuid-1234',
  email: 'test@example.com',
  name: 'Test User',
  role: 'PARENT',
  status: 'ACTIVE',
  isEmailVerified: true,
  avatarUrl: null,
  passwordHash: null,
  loginAttempts: 0,
  lockedUntil: null,
}

const mockPrisma = {
  user: {
    findUnique: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    updateMany: jest.fn(),
  },
  userSession: {
    create: jest.fn(),
    updateMany: jest.fn(),
    deleteMany: jest.fn(),
    findUnique: jest.fn(),
  },
  emailVerification: {
    create: jest.fn(),
    findUnique: jest.fn(),
    update: jest.fn(),
    updateMany: jest.fn(),
  },
  passwordReset: {
    create: jest.fn(),
    findUnique: jest.fn(),
    update: jest.fn(),
  },
  $transaction: jest.fn((ops: unknown[]) => Promise.all(ops)),
}

const mockJwt = {
  signAsync: jest.fn().mockResolvedValue('mock-token'),
}

const mockConfig = {
  get: jest.fn((key: string, def?: unknown) => {
    const map: Record<string, string> = {
      JWT_ACCESS_SECRET: 'test-access-secret',
      JWT_REFRESH_SECRET: 'test-refresh-secret',
      JWT_ACCESS_EXPIRES_IN: '15m',
      JWT_REFRESH_EXPIRES_IN: '7d',
      JWT_ISSUER: 'test',
      JWT_AUDIENCE: 'test',
      NODE_ENV: 'test',
      NEXT_PUBLIC_APP_URL: 'http://localhost:3000',
    }
    return map[key] ?? def
  }),
}

const mockAudit = {
  log: jest.fn().mockResolvedValue(undefined),
  logCreate: jest.fn().mockResolvedValue(undefined),
  logLogin: jest.fn().mockResolvedValue(undefined),
  logUpdate: jest.fn().mockResolvedValue(undefined),
  logDelete: jest.fn().mockResolvedValue(undefined),
}

const mockEmail = {
  sendWelcome: jest.fn().mockResolvedValue(undefined),
  sendEmailVerification: jest.fn().mockResolvedValue(undefined),
  sendPasswordReset: jest.fn().mockResolvedValue(undefined),
}

// ─── Tests ───────────────────────────────────────

describe('AuthService', () => {
  let service: AuthService

  beforeEach(async () => {
    jest.clearAllMocks()

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: JwtService, useValue: mockJwt },
        { provide: ConfigService, useValue: mockConfig },
        { provide: AuditService, useValue: mockAudit },
        { provide: EmailService, useValue: mockEmail },
      ],
    }).compile()

    service = module.get<AuthService>(AuthService)
  })

  // ─── register ─────────────────────────────────

  describe('register()', () => {
    const dto = {
      name: 'Test User',
      email: 'test@example.com',
      password: 'SecureP@ss1',
      role: 'PARENT' as const,
    }

    it('creates user and returns token pair', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null) // email not taken
      mockPrisma.user.create.mockResolvedValue({ ...mockUser })
      mockPrisma.emailVerification.create.mockResolvedValue({})
      mockPrisma.userSession.create.mockResolvedValue({})
      mockPrisma.userSession.deleteMany.mockResolvedValue({})

      const result = await service.register(dto, '127.0.0.1')

      expect(result.user.email).toBe(dto.email)
      expect(result.tokens.accessToken).toBe('mock-token')
      expect(mockPrisma.user.create).toHaveBeenCalledTimes(1)
      expect(mockEmail.sendWelcome).toHaveBeenCalledTimes(1)
      expect(mockEmail.sendEmailVerification).toHaveBeenCalledTimes(1)
    })

    it('throws ConflictException if email already exists', async () => {
      mockPrisma.user.findUnique.mockResolvedValue({ id: 'existing' })

      await expect(service.register(dto)).rejects.toThrow(ConflictException)
      expect(mockPrisma.user.create).not.toHaveBeenCalled()
    })
  })

  // ─── validateCredentials ──────────────────────

  describe('validateCredentials()', () => {
    const hash = bcrypt.hashSync('SecureP@ss1', 10)

    it('returns user when credentials are valid', async () => {
      mockPrisma.user.findUnique.mockResolvedValue({
        ...mockUser,
        passwordHash: hash,
      })
      mockPrisma.user.update.mockResolvedValue(mockUser)

      const result = await service.validateCredentials('test@example.com', 'SecureP@ss1')
      expect(result).not.toBeNull()
      expect(result?.email).toBe('test@example.com')
    })

    it('returns null when password is wrong', async () => {
      mockPrisma.user.findUnique.mockResolvedValue({
        ...mockUser,
        passwordHash: hash,
        loginAttempts: 0,
      })
      mockPrisma.user.update.mockResolvedValue(mockUser)

      const result = await service.validateCredentials('test@example.com', 'WrongPass1')
      expect(result).toBeNull()
    })

    it('returns null when user does not exist', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null)

      const result = await service.validateCredentials('nobody@example.com', 'AnyPass1')
      expect(result).toBeNull()
    })

    it('throws UnauthorizedException when account is locked', async () => {
      const futureDate = new Date(Date.now() + 10 * 60 * 1000)
      mockPrisma.user.findUnique.mockResolvedValue({
        ...mockUser,
        passwordHash: hash,
        lockedUntil: futureDate,
      })

      await expect(
        service.validateCredentials('test@example.com', 'SecureP@ss1'),
      ).rejects.toThrow(UnauthorizedException)
    })
  })

  // ─── forgotPassword ───────────────────────────

  describe('forgotPassword()', () => {
    it('creates reset token and sends email when user exists', async () => {
      mockPrisma.user.findUnique.mockResolvedValue({ id: 'u1', name: 'Test', email: 'test@example.com' })
      mockPrisma.passwordReset.create.mockResolvedValue({})

      await service.forgotPassword({ email: 'test@example.com' })

      expect(mockPrisma.passwordReset.create).toHaveBeenCalledTimes(1)
      expect(mockEmail.sendPasswordReset).toHaveBeenCalledTimes(1)
    })

    it('does not throw or leak info when user does not exist', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null)

      await expect(service.forgotPassword({ email: 'nobody@example.com' })).resolves.toBeUndefined()
      expect(mockEmail.sendPasswordReset).not.toHaveBeenCalled()
    })
  })

  // ─── logout ───────────────────────────────────

  describe('logout()', () => {
    it('revokes the session', async () => {
      mockPrisma.userSession.updateMany.mockResolvedValue({ count: 1 })

      await service.logout('refresh-token', 'user-id')

      expect(mockPrisma.userSession.updateMany).toHaveBeenCalledWith(
        expect.objectContaining({
          data: { isRevoked: true },
        }),
      )
      expect(mockAudit.log).toHaveBeenCalledTimes(1)
    })
  })
})
