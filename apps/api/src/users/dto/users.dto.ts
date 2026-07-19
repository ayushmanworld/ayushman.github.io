import {
  IsEmail,
  IsString,
  IsOptional,
  IsEnum,
  IsBoolean,
  MinLength,
  MaxLength,
  Matches,
  IsNumber,
  Min,
  Max,
} from 'class-validator'
import { ApiPropertyOptional } from '@nestjs/swagger'
import { Transform } from 'class-transformer'
import { UserRole } from '@prisma/client'

export class UpdateUserDto {
  @ApiPropertyOptional({ example: 'Priya Sharma' })
  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  @Transform(({ value }: { value: string }) => value?.trim())
  name?: string

  @ApiPropertyOptional({ example: '+91 9876543210' })
  @IsOptional()
  @IsString()
  @Matches(/^(\+91)?[6-9]\d{9}$/, { message: 'Enter a valid Indian mobile number' })
  @Transform(({ value }: { value: string }) => value?.replace(/\s/g, ''))
  phone?: string

  @ApiPropertyOptional({ example: 'Karnataka' })
  @IsOptional()
  @IsString()
  state?: string

  @ApiPropertyOptional({ example: 'Bangalore' })
  @IsOptional()
  @IsString()
  city?: string

  @ApiPropertyOptional({ example: 'India' })
  @IsOptional()
  @IsString()
  country?: string

  @ApiPropertyOptional({ enum: ['en', 'hi'], default: 'en' })
  @IsOptional()
  @IsString()
  language?: string

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  newsletterOptIn?: boolean
}

export class AdminUpdateUserDto extends UpdateUserDto {
  @ApiPropertyOptional({ enum: UserRole })
  @IsOptional()
  @IsEnum(UserRole)
  role?: UserRole

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  status?: string
}

export class UserQueryDto {
  @ApiPropertyOptional({ example: 1, default: 1 })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Transform(({ value }: { value: string }) => parseInt(value))
  page?: number

  @ApiPropertyOptional({ example: 20, default: 20 })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(100)
  @Transform(({ value }: { value: string }) => parseInt(value))
  limit?: number

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  search?: string

  @ApiPropertyOptional({ enum: UserRole })
  @IsOptional()
  @IsEnum(UserRole)
  role?: UserRole

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  status?: string

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  sortBy?: string

  @ApiPropertyOptional({ enum: ['asc', 'desc'], default: 'desc' })
  @IsOptional()
  @IsString()
  sortOrder?: 'asc' | 'desc'
}
