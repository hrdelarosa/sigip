import { ForbiddenException, Injectable } from '@nestjs/common';
import { generateUuidV7 } from '../../common/utils/generate-uuid-v7.util';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { ChangeUserStatusDto } from './dto/change-user-status.dto';
import { ChangeUserPasswordDto } from './dto/change-user-password.dto';
import {
  EmptyUserUpdateError,
  InvalidUserRoleError,
  UserChangePasswordError,
  UserPersistenceError,
  UsernameAlreadyExistsError,
  UserNotFoundError,
} from './users.errors';
import { UsersRepository } from './repositories/users.repository';
import { CryptoService } from '../../common/crypto/crypto.service';
import { RolesRepository } from '../roles/repositories/roles.repository';
import { hasMysqlErrorCode } from '../../database/utils/mysql-error.util';
import { UserModel, UserWithPasswordModel } from './models/user.model';
import type { UserAuditContext } from './types/user.types';
import { SessionsRepository } from '../sessions/repositories/sessions.repository';
import { AuditRepository } from '../audit/repositories/audit.repository';
import type { ListUsersQueryDto } from './dto/list-users-query.dto';
import type { AuthenticatedUserModel } from '../auth/models/authenticated-user.model';
import { getOfficeScope } from '../../common/authorization/office-scope';
import { OfficesService } from '../offices/offices.service';

@Injectable()
export class UsersService {
  constructor(
    private readonly usersRepository: UsersRepository,
    private readonly cryptoService: CryptoService,
    private readonly rolesRepository: RolesRepository,
    private readonly sessionsRepository: SessionsRepository,
    private readonly auditRepository: AuditRepository,
    private readonly officesService: OfficesService,
  ) {}

  private async ensureRoleIsActive(roleId: string): Promise<void> {
    const role = await this.rolesRepository.findById(roleId);

    if (!role?.isActive) throw new InvalidUserRoleError();
  }

  private toPublicUser(user: UserWithPasswordModel): UserModel {
    const { passwordHash: _passwordHash, ...publicUser } = user;

    return publicUser;
  }

  private handlePersistenceError(error: unknown): never {
    if (hasMysqlErrorCode(error, 'ER_DUP_ENTRY')) {
      throw new UsernameAlreadyExistsError();
    }

    if (hasMysqlErrorCode(error, 'ER_NO_REFERENCED_ROW_2')) {
      throw new InvalidUserRoleError();
    }

    throw new UserPersistenceError();
  }

  private resolveTargetOfficeId(
    actor: AuthenticatedUserModel,
    requestedOfficeId?: string,
  ): string {
    const scope = getOfficeScope(actor);

    if (requestedOfficeId === undefined) return scope.officeId;

    if (scope.canAccessAllOffices) return requestedOfficeId;

    if (requestedOfficeId !== scope.officeId) {
      throw new ForbiddenException(
        'No puedes administrar usuarios de otra oficina',
      );
    }

    return scope.officeId;
  }

  async findAll(query: ListUsersQueryDto, actor: AuthenticatedUserModel) {
    const scope = getOfficeScope(actor);
    return this.usersRepository.findAll(
      query,
      scope.canAccessAllOffices ? undefined : scope.officeId,
    );
  }

  async findById(id: string, actor?: AuthenticatedUserModel) {
    const scope = actor ? getOfficeScope(actor) : undefined;
    const user = await this.usersRepository.findById(
      id,
      scope && !scope.canAccessAllOffices ? scope.officeId : undefined,
    );

    if (!user) throw new UserNotFoundError();

    return user;
  }

  async findDetails(
    id: string,
    actor: AuthenticatedUserModel,
    options: {
      includeSessions: boolean;
      includeAudit: boolean;
      currentSessionId: string;
    },
  ) {
    const user = await this.findById(id, actor);
    const role = await this.rolesRepository.findById(user.roleId);

    if (!role) throw new InvalidUserRoleError();

    const permissions = await this.rolesRepository.findPermissions(role.id);
    const now = new Date();
    const [sessionSummary, auditResult, creatorResult] = await Promise.all([
      options.includeSessions
        ? this.sessionsRepository.findSessionSummaryForUser(
            id,
            options.currentSessionId,
            now,
            new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000),
          )
        : null,
      options.includeAudit
        ? this.auditRepository.findAll({
            page: 1,
            limit: 10,
            entityType: 'USER',
            entityId: id,
          })
        : null,
      options.includeAudit
        ? this.auditRepository.findAll({
            page: 1,
            limit: 1,
            action: 'CREATED',
            entityType: 'USER',
            entityId: id,
          })
        : null,
    ]);
    const recentAudit = auditResult?.items ?? null;
    const createdBy = creatorResult?.items[0]?.actor ?? null;

    return {
      user,
      role,
      permissions,
      sessionSummary,
      recentAudit,
      createdBy,
    };
  }

  async create(
    dto: CreateUserDto,
    actor: AuthenticatedUserModel,
    auditContext: UserAuditContext,
  ) {
    const normalizedUsername = dto.username.trim().toLowerCase();
    const officeId = this.resolveTargetOfficeId(actor, dto.officeId);

    await this.ensureRoleIsActive(dto.roleId);
    await this.officesService.ensureActive(officeId);

    const existingUser =
      await this.usersRepository.findByUsername(normalizedUsername);

    if (existingUser) throw new UsernameAlreadyExistsError();

    try {
      return await this.usersRepository.create(
        {
          id: generateUuidV7(),
          roleId: dto.roleId,
          officeId,
          username: normalizedUsername,
          fullName: dto.fullName.trim(),
          passwordHash: await this.cryptoService.hashPassword(dto.password),
        },
        auditContext,
      );
    } catch (error) {
      this.handlePersistenceError(error);
    }
  }

  async update(
    id: string,
    dto: UpdateUserDto,
    actor: AuthenticatedUserModel,
    auditContext: UserAuditContext,
  ) {
    const user = await this.findById(id, actor);
    const scope = getOfficeScope(actor);
    const scopeOfficeId = scope.canAccessAllOffices
      ? undefined
      : scope.officeId;
    const normalizedUsername = dto.username?.trim().toLowerCase();
    const normalizedFullName = dto.fullName?.trim();
    const targetOfficeId =
      dto.officeId === undefined
        ? undefined
        : this.resolveTargetOfficeId(actor, dto.officeId);

    if (
      dto.roleId === undefined &&
      targetOfficeId === undefined &&
      normalizedUsername === undefined &&
      normalizedFullName === undefined
    ) {
      throw new EmptyUserUpdateError();
    }

    if (dto.roleId !== undefined) await this.ensureRoleIsActive(dto.roleId);
    if (targetOfficeId !== undefined)
      await this.officesService.ensureActive(targetOfficeId);

    if (
      normalizedUsername !== undefined &&
      normalizedUsername !== user.username
    ) {
      const existingUser =
        await this.usersRepository.findByUsername(normalizedUsername);

      if (existingUser && existingUser.id !== id) {
        throw new UsernameAlreadyExistsError();
      }
    }

    let updatedUser: UserModel | null;

    try {
      updatedUser = await this.usersRepository.update(
        id,
        {
          roleId: dto.roleId,
          officeId: targetOfficeId,
          username: normalizedUsername,
          fullName: normalizedFullName,
          updatedAt: new Date(),
        },
        auditContext,
        scopeOfficeId,
      );
    } catch (error) {
      this.handlePersistenceError(error);
    }

    if (!updatedUser) throw new UserNotFoundError();

    return updatedUser;
  }

  async changeStatus(
    id: string,
    dto: ChangeUserStatusDto,
    actor: AuthenticatedUserModel,
  ) {
    const scope = getOfficeScope(actor);
    const officeId = scope.canAccessAllOffices ? undefined : scope.officeId;
    const user = await this.findById(id, actor);

    if (user.isActive === dto.isActive) return user;

    const updateUser = await this.usersRepository.updateStatus(
      id,
      dto.isActive,
      new Date(),
      actor.userId,
      actor.sessionId,
      officeId,
    );

    if (!updateUser) throw new UserNotFoundError();

    return updateUser;
  }

  async changePassword(
    id: string,
    dto: ChangeUserPasswordDto,
    actor: AuthenticatedUserModel,
  ) {
    const scope = getOfficeScope(actor);
    const officeId = scope.canAccessAllOffices ? undefined : scope.officeId;
    const user = await this.usersRepository.findByIdWithPassword(id, officeId);

    if (!user) throw new UserNotFoundError();

    if (!user.isActive) throw new UserChangePasswordError();

    if (
      await this.cryptoService.verifyPassword(dto.password, user.passwordHash)
    ) {
      return this.toPublicUser(user);
    }

    let updatedUser: UserModel | null;

    try {
      updatedUser = await this.usersRepository.updatePassword(
        id,
        await this.cryptoService.hashPassword(dto.password),
        new Date(),
        actor.userId,
        actor.sessionId,
        officeId,
      );
    } catch (error) {
      this.handlePersistenceError(error);
    }

    if (!updatedUser) throw new UserNotFoundError();

    return updatedUser;
  }
}
