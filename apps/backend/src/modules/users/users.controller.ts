import {
  Body,
  Controller,
  ForbiddenException,
  Get,
  Param,
  Patch,
  Post,
  Req,
  Query,
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
import {
  UserApiResponse,
  UsersApiResponse,
} from '../../common/swagger/api.models';
import { RequirePermissions } from '../../common/decorators/require-permissions.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type { AuthenticatedUserModel } from '../auth/models/authenticated-user.model';
import type { AuthenticatedRequest } from '../../common/types/authenticated-request.type';
import { ListUsersQueryDto } from './dto/list-users-query.dto';
import { toPaginatedResponse } from '../../common/pagination/presenters/pagination.presenter';

@Controller('users')
@ApiTags('Users')
@RequirePermissions('users:read')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @ApiOperation({ summary: 'Listar usuarios' })
  @ApiOkResponse({ type: UsersApiResponse })
  async findAll(
    @Query() query: ListUsersQueryDto,
    @CurrentUser() actor: AuthenticatedUserModel,
  ): Promise<UsersResponse> {
    const result = await this.usersService.findAll(query, actor);

    return toPaginatedResponse(
      result.items,
      result.total,
      query.page,
      query.limit,
      toUserResponse,
    );
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
    const details = await this.usersService.findDetails(params.id, actor, {
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
      request.authenticatedUser,
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
      request.authenticatedUser,
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
    const user = await this.usersService.changeStatus(params.id, dto, actor);

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
    const user = await this.usersService.changePassword(params.id, dto, actor);

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
