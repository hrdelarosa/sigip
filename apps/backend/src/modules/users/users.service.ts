import { Injectable } from '@nestjs/common';
import { generateUuidV7 } from '../../common/utils/generate-uuid-v7.util';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { ChangeUserStatusDto } from './dto/change-user-status.dto';
import { ChangeUserPasswordDto } from './dto/change-user-password.dto';
import {
  UserChangePasswordError,
  UsernameAlreadyExistsError,
  UserNotFoundError,
} from './users.errors';
import { UsersRepository } from './repositories/users.repository';
import { CryptoService } from '../../common/crypto/crypto.service';

@Injectable()
export class UsersService {
  constructor(
    private readonly usersRepository: UsersRepository,
    private readonly cryptoService: CryptoService,
  ) {}

  async findAll() {
    return await this.usersRepository.findAll();
  }

  async findById(id: string) {
    const user = await this.usersRepository.findById(id);

    if (!user) throw new UserNotFoundError();

    return user;
  }

  async create(dto: CreateUserDto) {
    const normalizedUsername = dto.username.trim();
    const existingUser =
      await this.usersRepository.findByUsername(normalizedUsername);

    if (existingUser) throw new UsernameAlreadyExistsError();

    return this.usersRepository.create({
      id: generateUuidV7(),
      roleId: dto.roleId,
      username: normalizedUsername,
      fullName: dto.fullName,
      password: await this.cryptoService.hashPassword(dto.password),
    });
  }

  async update(id: string, dto: UpdateUserDto) {
    await this.findById(id);

    const updatedUser = await this.usersRepository.update(id, {
      roleId: dto.roleId !== undefined ? dto.roleId : undefined,
      username: dto.username !== undefined ? dto.username.trim() : undefined,
      fullName: dto.fullName !== undefined ? dto.fullName.trim() : undefined,
      updatedAt: new Date(),
    });

    if (!updatedUser) throw new UserNotFoundError();

    return updatedUser;
  }

  async changeStatus(id: string, dto: ChangeUserStatusDto) {
    const user = await this.findById(id);

    if (user.isActive === dto.isActive) return user;

    const updateUser = await this.usersRepository.updateStatus(
      id,
      dto.isActive,
      new Date(),
    );

    if (!updateUser) throw new UserNotFoundError();

    return updateUser;
  }

  async changePassword(id: string, dto: ChangeUserPasswordDto) {
    const user = await this.findById(id);

    if (await this.cryptoService.verifyPassword(dto.password, user.password)) {
      return user;
    }

    if (!user.isActive) throw new UserChangePasswordError();

    const updatedUser = await this.usersRepository.updatePassword(
      id,
      await this.cryptoService.hashPassword(dto.password),
      new Date(),
    );

    if (!updatedUser) throw new UserNotFoundError();

    return updatedUser;
  }
}
