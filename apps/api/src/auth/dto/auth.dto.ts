import {
  IsEmail,
  IsString,
  MinLength,
  MaxLength,
  IsOptional,
  Matches,
  IsEnum,
} from 'class-validator'
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { Transform } from 'class-transformer'
import { UserRole } from '@prisma/client'

// ─────────────────────────────────────────────────
// Register
// ─────────────────────────────────────────────────

export class RegisterDto {
  @ApiProperty({ example: 'Priya Sharma', description: 'Full name' })
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  @Transform(({ value }: { value: string }) => value?.trim())
  name: string

  @ApiProperty({ example: 'priya@example.com', description: 'Email address' })
  @IsEmail()
  @Transform(({ value }: { value: string }) => value?.trim().toLowerCase())
  email: string

  @ApiProperty({ example: 'SecureP@ss1', description: 'Password (min 8 chars, 1 uppercase, 1 number)' })
  @IsString()
  @MinLength(8)
  @MaxLength(128)
  @Matches(/^(?=.*[A-Z])(?=.*[0-9])/, {
    message: 'Password must contain at least one uppercase letter and one number',
  })
  password: string

  @ApiPropertyOptional({ example: '+91 9876543210', description: 'Mobile number' })
  @IsOptional()
  @IsString()
  @Matches(/^(\+91)?[6-9]\d{9}$/, { message: 'Enter a valid Indian mobile number' })
  @Transform(({ value }: { value: string }) => value?.replace(/\s/g, ''))
  phone?: string

  @ApiPropertyOptional({ enum: UserRole, default: 'PARENT' })
  @IsOptional()
  @IsEnum(['DONOR', 'PARENT', 'PARTNER', 'THERAPIST', 'EDUCATOR', 'VOLUNTEER'])
  role?: UserRole
}

// ─────────────────────────────────────────────────
// Login
// ─────────────────────────────────────────────────

export class LoginDto {
  @ApiProperty({ example: 'priya@example.com' })
  @IsEmail()
  @Transform(({ value }: { value: string }) => value?.trim().toLowerCase())
  email: string

  @ApiProperty({ example: 'SecureP@ss1' })
  @IsString()
  @MinLength(1)
  password: string
}

// ─────────────────────────────────────────────────
// Refresh Token
// ─────────────────────────────────────────────────

export class RefreshTokenDto {
  @ApiProperty({ description: 'Refresh token from previous login' })
  @IsString()
  @MinLength(1)
  refreshToken: string
}

// ─────────────────────────────────────────────────
// Forgot Password
// ─────────────────────────────────────────────────

export class ForgotPasswordDto {
  @ApiProperty({ example: 'priya@example.com' })
  @IsEmail()
  @Transform(({ value }: { value: string }) => value?.trim().toLowerCase())
  email: string
}

// ─────────────────────────────────────────────────
// Reset Password
// ─────────────────────────────────────────────────

export class ResetPasswordDto {
  @ApiProperty({ description: 'Reset token from email link' })
  @IsString()
  @MinLength(1)
  token: string

  @ApiProperty({ example: 'NewSecureP@ss1' })
  @IsString()
  @MinLength(8)
  @MaxLength(128)
  @Matches(/^(?=.*[A-Z])(?=.*[0-9])/, {
    message: 'Password must contain at least one uppercase letter and one number',
  })
  password: string
}

// ─────────────────────────────────────────────────
// Verify Email
// ─────────────────────────────────────────────────

export class VerifyEmailDto {
  @ApiProperty({ description: 'Email verification token from email link' })
  @IsString()
  @MinLength(1)
  token: string
}

// ─────────────────────────────────────────────────
// Change Password
// ─────────────────────────────────────────────────

export class ChangePasswordDto {
  @ApiProperty()
  @IsString()
  @MinLength(1)
  currentPassword: string

  @ApiProperty()
  @IsString()
  @MinLength(8)
  @MaxLength(128)
  @Matches(/^(?=.*[A-Z])(?=.*[0-9])/, {
    message: 'Password must contain at least one uppercase letter and one number',
  })
  newPassword: string
}
