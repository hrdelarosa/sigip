import {
  Body,
  Controller,
  ForbiddenException,
  Get,
  Param,
  Patch,
  Post,
  Req,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { ChangeUserStatusDto } from './dto/change-user-status.dto';
import { ChangeUserPasswordDto } from './dto/change-user-password.dto';
import { UserIdParamDto } from './dto/user-id-param.dto';
import type {
  UserDetailsResponse,
  UserResponse,
  UsersResponse,
} from '@sigip/shared';
import {
  toUserDetailsResponse,
  toUserResponse,
} from './presenters/user.presenter';
import {
  ApiBadRequestResponse,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { UserApiResponse } from '../../common/swagger/api.models';
import { RequirePermissions } from '../../common/decorators/require-permissions.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type { AuthenticatedUserModel } from '../auth/models/authenticated-user.model';
import type { AuthenticatedRequest } from '../../common/types/authenticated-request.type';

@Controller('users')
@ApiTags('Users')
@RequirePermissions('users:read')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @ApiOperation({ summary: 'Listar usuarios' })
  @ApiOkResponse({ type: UserApiResponse, isArray: true })
  async findAll(): Promise<UsersResponse> {
    const users = await this.usersService.findAll();

    return users.map(toUserResponse);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener un usuario por ID' })
  @ApiParam({ name: 'id', format: 'uuid' })
  @ApiOkResponse({ type: UserApiResponse })
  @ApiNotFoundResponse({ description: 'Usuario no encontrado' })
  @ApiBadRequestResponse({ description: 'UUID inválido' })
  async findOne(
    @Param() params: UserIdParamDto,
    @CurrentUser() actor: AuthenticatedUserModel,
  ): Promise<UserDetailsResponse> {
    const details = await this.usersService.findDetails(params.id, {
      includeSessions: actor.permissions.includes('sessions:read'),
      includeAudit: actor.permissions.includes('audit:read'),
      currentSessionId: actor.sessionId,
    });

    return toUserDetailsResponse(details);
  }

  @Post()
  @RequirePermissions('users:create')
  @ApiOperation({ summary: 'Crear un usuario' })
  @ApiCreatedResponse({ type: UserApiResponse })
  @ApiBadRequestResponse({ description: 'Datos de entrada inválidos' })
  async create(
    @Body() dto: CreateUserDto,
    @Req() request: AuthenticatedRequest,
  ): Promise<UserResponse> {
    const user = await this.usersService.create(
      dto,
      this.auditContext(request),
    );

    return toUserResponse(user);
  }

  @Patch(':id')
  @RequirePermissions('users:update')
  @ApiOperation({ summary: 'Actualizar un usuario' })
  @ApiParam({ name: 'id', format: 'uuid' })
  @ApiOkResponse({ type: UserApiResponse })
  @ApiNotFoundResponse({ description: 'Usuario no encontrado' })
  async update(
    @Param() params: UserIdParamDto,
    @Body() dto: UpdateUserDto,
    @Req() request: AuthenticatedRequest,
  ): Promise<UserResponse> {
    const user = await this.usersService.update(
      params.id,
      dto,
      this.auditContext(request),
    );

    return toUserResponse(user);
  }

  @Patch(':id/status')
  @ApiOperation({ summary: 'Activar o desactivar un usuario' })
  @ApiParam({ name: 'id', format: 'uuid' })
  @ApiOkResponse({ type: UserApiResponse })
  @ApiNotFoundResponse({ description: 'Usuario no encontrado' })
  async changeStatus(
    @Param() params: UserIdParamDto,
    @Body() dto: ChangeUserStatusDto,
    @CurrentUser() actor: AuthenticatedUserModel,
  ): Promise<UserResponse> {
    const permission = dto.isActive ? 'users:activate' : 'users:deactivate';
    if (!actor.permissions.includes(permission)) {
      throw new ForbiddenException('Permisos insuficientes');
    }
    const user = await this.usersService.changeStatus(
      params.id,
      dto,
      this.auditContextFromUser(actor),
    );

    return toUserResponse(user);
  }

  @Patch(':id/password')
  @RequirePermissions('users:reset-password')
  @ApiOperation({ summary: 'Cambiar la contraseña de un usuario' })
  @ApiParam({ name: 'id', format: 'uuid' })
  @ApiOkResponse({ type: UserApiResponse })
  @ApiNotFoundResponse({ description: 'Usuario no encontrado' })
  async changePassword(
    @Param() params: UserIdParamDto,
    @Body() dto: ChangeUserPasswordDto,
    @CurrentUser() actor: AuthenticatedUserModel,
  ): Promise<UserResponse> {
    const user = await this.usersService.changePassword(
      params.id,
      dto,
      this.auditContextFromUser(actor),
    );

    return toUserResponse(user);
  }

  private auditContext(request: AuthenticatedRequest) {
    return {
      ...this.auditContextFromUser(request.authenticatedUser),
      ipAddress: request.ip?.slice(0, 45) ?? null,
      userAgent: request.get('user-agent')?.slice(0, 500) ?? null,
    };
  }

  private auditContextFromUser(actor: AuthenticatedUserModel) {
    return { userId: actor.userId, sessionId: actor.sessionId };
  }
}
