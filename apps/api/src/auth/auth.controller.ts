import {
  Controller,
  Post,
  Get,
  Body,
  UseGuards,
  HttpCode,
  HttpStatus,
  Req,
  Patch,
} from '@nestjs/common'
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiBody,
} from '@nestjs/swagger'
import type { Request } from 'express'
import { AuthService } from './auth.service'
import {
  RegisterDto,
  LoginDto,
  RefreshTokenDto,
  ForgotPasswordDto,
  ResetPasswordDto,
  VerifyEmailDto,
  ChangePasswordDto,
} from './dto/auth.dto'
import {
  LocalAuthGuard,
  JwtRefreshGuard,
} from './guards/auth.guards'
import {
  CurrentUser,
  Public,
  IpAddress,
  UserAgent,
} from './decorators/auth.decorators'
import { JwtAuthGuard } from './guards/auth.guards'
import type { AuthUser } from '@ayushman/types'

@ApiTags('auth')
@Controller('auth')
@UseGuards(JwtAuthGuard)
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  // ─────────────────────────────────────────────────
  // POST /auth/register
  // ─────────────────────────────────────────────────

  @Post('register')
  @Public()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Register a new user account' })
  @ApiResponse({ status: 201, description: 'Account created. Verification email sent.' })
  @ApiResponse({ status: 409, description: 'Email already in use.' })
  async register(
    @Body() dto: RegisterDto,
    @IpAddress() ipAddress: string,
  ) {
    const result = await this.authService.register(dto, ipAddress)
    return {
      success: true,
      data: result,
      message: 'Account created. Please check your email to verify your account.',
      timestamp: new Date().toISOString(),
    }
  }

  // ─────────────────────────────────────────────────
  // POST /auth/login
  // ─────────────────────────────────────────────────

  @Post('login')
  @Public()
  @UseGuards(LocalAuthGuard)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Login with email and password' })
  @ApiBody({ type: LoginDto })
  @ApiResponse({ status: 200, description: 'Login successful. Returns JWT tokens.' })
  @ApiResponse({ status: 401, description: 'Invalid credentials.' })
  async login(
    @CurrentUser() user: AuthUser,
    @Req() req: Request,
    @IpAddress() ipAddress: string,
    @UserAgent() userAgent: string,
  ) {
    const result = await this.authService.login(user, ipAddress, userAgent)
    return {
      success: true,
      data: result,
      message: 'Login successful',
      timestamp: new Date().toISOString(),
    }
  }

  // ─────────────────────────────────────────────────
  // POST /auth/refresh
  // ─────────────────────────────────────────────────

  @Post('refresh')
  @Public()
  @UseGuards(JwtRefreshGuard)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Refresh JWT tokens using refresh token' })
  @ApiBody({ type: RefreshTokenDto })
  @ApiResponse({ status: 200, description: 'New token pair issued.' })
  @ApiResponse({ status: 401, description: 'Invalid or expired refresh token.' })
  async refresh(
    @CurrentUser() user: { id: string; refreshToken: string },
  ) {
    const tokens = await this.authService.refreshTokens(user.id, user.refreshToken)
    return {
      success: true,
      data: { tokens },
      message: 'Tokens refreshed',
      timestamp: new Date().toISOString(),
    }
  }

  // ─────────────────────────────────────────────────
  // POST /auth/logout
  // ─────────────────────────────────────────────────

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Logout and revoke refresh token' })
  @ApiResponse({ status: 200, description: 'Logged out successfully.' })
  async logout(
    @CurrentUser() user: AuthUser,
    @Body() dto: RefreshTokenDto,
  ) {
    await this.authService.logout(dto.refreshToken, user.id)
    return {
      success: true,
      data: null,
      message: 'Logged out successfully',
      timestamp: new Date().toISOString(),
    }
  }

  // ─────────────────────────────────────────────────
  // POST /auth/logout-all
  // ─────────────────────────────────────────────────

  @Post('logout-all')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Logout from all devices' })
  async logoutAll(@CurrentUser() user: AuthUser) {
    await this.authService.logoutAll(user.id)
    return {
      success: true,
      data: null,
      message: 'Logged out from all devices',
      timestamp: new Date().toISOString(),
    }
  }

  // ─────────────────────────────────────────────────
  // GET /auth/me
  // ─────────────────────────────────────────────────

  @Get('me')
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Get currently authenticated user' })
  @ApiResponse({ status: 200, description: 'Current user data.' })
  @ApiResponse({ status: 401, description: 'Not authenticated.' })
  me(@CurrentUser() user: AuthUser) {
    return {
      success: true,
      data: { user },
      timestamp: new Date().toISOString(),
    }
  }

  // ─────────────────────────────────────────────────
  // POST /auth/verify-email
  // ─────────────────────────────────────────────────

  @Post('verify-email')
  @Public()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Verify email address using token from email' })
  @ApiResponse({ status: 200, description: 'Email verified successfully.' })
  @ApiResponse({ status: 400, description: 'Invalid or expired token.' })
  async verifyEmail(@Body() dto: VerifyEmailDto) {
    await this.authService.verifyEmail(dto)
    return {
      success: true,
      data: null,
      message: 'Email verified successfully. Your account is now active.',
      timestamp: new Date().toISOString(),
    }
  }

  // ─────────────────────────────────────────────────
  // POST /auth/resend-verification
  // ─────────────────────────────────────────────────

  @Post('resend-verification')
  @ApiBearerAuth('access-token')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Resend email verification link' })
  async resendVerification(@CurrentUser() user: AuthUser) {
    await this.authService.resendVerificationEmail(user.id)
    return {
      success: true,
      data: null,
      message: 'Verification email sent.',
      timestamp: new Date().toISOString(),
    }
  }

  // ─────────────────────────────────────────────────
  // POST /auth/forgot-password
  // ─────────────────────────────────────────────────

  @Post('forgot-password')
  @Public()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Request a password reset email' })
  @ApiResponse({ status: 200, description: 'Reset email sent if account exists.' })
  async forgotPassword(@Body() dto: ForgotPasswordDto) {
    await this.authService.forgotPassword(dto)
    return {
      success: true,
      data: null,
      message: 'If an account exists with this email, a password reset link has been sent.',
      timestamp: new Date().toISOString(),
    }
  }

  // ─────────────────────────────────────────────────
  // POST /auth/reset-password
  // ─────────────────────────────────────────────────

  @Post('reset-password')
  @Public()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Reset password using token from email' })
  @ApiResponse({ status: 200, description: 'Password reset successfully.' })
  @ApiResponse({ status: 400, description: 'Invalid or expired token.' })
  async resetPassword(@Body() dto: ResetPasswordDto) {
    await this.authService.resetPassword(dto)
    return {
      success: true,
      data: null,
      message: 'Password reset successfully. Please login with your new password.',
      timestamp: new Date().toISOString(),
    }
  }

  // ─────────────────────────────────────────────────
  // PATCH /auth/change-password
  // ─────────────────────────────────────────────────

  @Patch('change-password')
  @ApiBearerAuth('access-token')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Change password (authenticated user)' })
  async changePassword(
    @CurrentUser() user: AuthUser,
    @Body() dto: ChangePasswordDto,
  ) {
    await this.authService.changePassword(user.id, dto)
    return {
      success: true,
      data: null,
      message: 'Password changed successfully. Please login again.',
      timestamp: new Date().toISOString(),
    }
  }
}
