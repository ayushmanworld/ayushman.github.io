import {
  Controller,
  Get,
  Patch,
  Delete,
  Param,
  Body,
  Query,
  HttpCode,
  HttpStatus,
  UseGuards,
  ParseUUIDPipe,
  Post,
} from '@nestjs/common'
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiParam,
} from '@nestjs/swagger'
import { UsersService } from './users.service'
import { UpdateUserDto, AdminUpdateUserDto, UserQueryDto } from './dto/users.dto'
import { JwtAuthGuard } from '../auth/guards/auth.guards'
import { CurrentUser, Roles, RequirePermissions } from '../auth/decorators/auth.decorators'
import { Permission } from '../rbac/permission.matrix'
import type { AuthUser } from '@ayushman/types'

@ApiTags('users')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard)
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  // ─────────────────────────────────────────────────
  // GET /users/me
  // ─────────────────────────────────────────────────

  @Get('me')
  @ApiOperation({ summary: 'Get own profile' })
  async getMe(@CurrentUser() user: AuthUser) {
    const data = await this.usersService.findMe(user.id)
    return { success: true, data, timestamp: new Date().toISOString() }
  }

  // ─────────────────────────────────────────────────
  // PATCH /users/me
  // ─────────────────────────────────────────────────

  @Patch('me')
  @ApiOperation({ summary: 'Update own profile' })
  async updateMe(
    @CurrentUser() user: AuthUser,
    @Body() dto: UpdateUserDto,
  ) {
    const data = await this.usersService.updateMe(user.id, dto)
    return { success: true, data, message: 'Profile updated', timestamp: new Date().toISOString() }
  }

  // ─────────────────────────────────────────────────
  // DELETE /users/me
  // ─────────────────────────────────────────────────

  @Delete('me')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete own account (soft delete)' })
  async deleteMe(@CurrentUser() user: AuthUser) {
    await this.usersService.deleteMe(user.id)
    return { success: true, data: null, message: 'Account deleted', timestamp: new Date().toISOString() }
  }

  // ─────────────────────────────────────────────────
  // GET /users — Admin only
  // ─────────────────────────────────────────────────

  @Get()
  @Roles('ADMIN', 'FOUNDER')
  @RequirePermissions(Permission.USERS_READ_ANY)
  @ApiOperation({ summary: '[Admin] List all users with pagination and filters' })
  async findAll(@Query() query: UserQueryDto) {
    const data = await this.usersService.findAll(query)
    return { success: true, data, timestamp: new Date().toISOString() }
  }

  // ─────────────────────────────────────────────────
  // GET /users/:id — Admin only
  // ─────────────────────────────────────────────────

  @Get(':id')
  @Roles('ADMIN', 'FOUNDER')
  @RequirePermissions(Permission.USERS_READ_ANY)
  @ApiOperation({ summary: '[Admin] Get user by ID' })
  @ApiParam({ name: 'id', description: 'User UUID' })
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    const data = await this.usersService.findById(id)
    return { success: true, data, timestamp: new Date().toISOString() }
  }

  // ─────────────────────────────────────────────────
  // PATCH /users/:id — Admin only
  // ─────────────────────────────────────────────────

  @Patch(':id')
  @Roles('ADMIN', 'FOUNDER')
  @RequirePermissions(Permission.USERS_UPDATE_ANY)
  @ApiOperation({ summary: '[Admin] Update any user' })
  @ApiParam({ name: 'id', description: 'User UUID' })
  async adminUpdate(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: AdminUpdateUserDto,
    @CurrentUser() actor: AuthUser,
  ) {
    const data = await this.usersService.adminUpdate(id, dto, actor)
    return { success: true, data, message: 'User updated', timestamp: new Date().toISOString() }
  }

  // ─────────────────────────────────────────────────
  // POST /users/:id/suspend — Admin only
  // ─────────────────────────────────────────────────

  @Post(':id/suspend')
  @Roles('ADMIN', 'FOUNDER')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '[Admin] Suspend a user account' })
  @ApiParam({ name: 'id', description: 'User UUID' })
  @ApiResponse({ status: 200, description: 'User suspended.' })
  async suspend(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() actor: AuthUser,
  ) {
    await this.usersService.suspend(id, actor)
    return { success: true, data: null, message: 'User suspended', timestamp: new Date().toISOString() }
  }
}
