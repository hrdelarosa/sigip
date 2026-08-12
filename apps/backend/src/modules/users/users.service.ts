import { Injectable } from '@nestjs/common';
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

@Injectable()
export class UsersService {
  constructor(
    private readonly usersRepository: UsersRepository,
    private readonly cryptoService: CryptoService,
    private readonly rolesRepository: RolesRepository,
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

  async findAll() {
    return await this.usersRepository.findAll();
  }

  async findById(id: string) {
    const user = await this.usersRepository.findById(id);

    if (!user) throw new UserNotFoundError();

    return user;
  }

  async create(dto: CreateUserDto) {
    const normalizedUsername = dto.username.trim().toLowerCase();
    await this.ensureRoleIsActive(dto.roleId);

    const existingUser =
      await this.usersRepository.findByUsername(normalizedUsername);

    if (existingUser) throw new UsernameAlreadyExistsError();

    try {
      return await this.usersRepository.create({
        id: generateUuidV7(),
        roleId: dto.roleId,
        username: normalizedUsername,
        fullName: dto.fullName.trim(),
        passwordHash: await this.cryptoService.hashPassword(dto.password),
      });
    } catch (error) {
      this.handlePersistenceError(error);
    }
  }

  async update(id: string, dto: UpdateUserDto) {
    const user = await this.findById(id);
    const normalizedUsername = dto.username?.trim().toLowerCase();
    const normalizedFullName = dto.fullName?.trim();

    if (
      dto.roleId === undefined &&
      normalizedUsername === undefined &&
      normalizedFullName === undefined
    ) {
      throw new EmptyUserUpdateError();
    }

    if (dto.roleId !== undefined) await this.ensureRoleIsActive(dto.roleId);

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
      updatedUser = await this.usersRepository.update(id, {
        roleId: dto.roleId,
        username: normalizedUsername,
        fullName: normalizedFullName,
        updatedAt: new Date(),
      });
    } catch (error) {
      this.handlePersistenceError(error);
    }

    if (!updatedUser) throw new UserNotFoundError();

    return updatedUser;
  }

  async changeStatus(id: string, dto: ChangeUserStatusDto, actorId: string) {
    const user = await this.findById(id);

    if (user.isActive === dto.isActive) return user;

    const updateUser = await this.usersRepository.updateStatus(
      id,
      dto.isActive,
      new Date(),
      actorId,
    );

    if (!updateUser) throw new UserNotFoundError();

    return updateUser;
  }

  async changePassword(
    id: string,
    dto: ChangeUserPasswordDto,
    actorId: string,
  ) {
    const user = await this.usersRepository.findByIdWithPassword(id);

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
        actorId,
      );
    } catch (error) {
      this.handlePersistenceError(error);
    }

    if (!updatedUser) throw new UserNotFoundError();

    return updatedUser;
  }
}
