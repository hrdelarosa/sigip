import {
  BadRequestException,
  ConflictException,
  Injectable,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { v7 as uuidv7 } from 'uuid';
import * as argon2 from 'argon2';
import { ChangeUserStatusDto } from './dto/change-user-status.dto';
import { ChangeUserPasswordDto } from './dto/change-user-password.dto';

@Injectable()
export class UsersService {
  private readonly filePath = join(process.cwd(), 'src/data/users.json');
  private readonly users: User[] = JSON.parse(
    readFileSync(this.filePath, 'utf-8'),
  ) as User[];

  async create(createUserDto: CreateUserDto) {
    console.log('creando user');
    const userExists = this.users.some(
      (user) => user.username === createUserDto.username,
    );

    if (userExists) throw new ConflictException('El username ya existe');

    const passwordHash = await argon2.hash(createUserDto.password);

    const user: User = {
      id: uuidv7(),
      roleId: createUserDto.roleId,
      username: createUserDto.username,
      fullName: createUserDto.fullName,
      password: passwordHash,
      isActive: true,
      lastLoginAt: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.users.push(user);

    writeFileSync(this.filePath, JSON.stringify(this.users, null, 2), 'utf-8');

    const { password: _, ...safeUser } = user;

    return safeUser;
  }

  findAll() {
    return this.users.map(({ password: _, ...user }) => user);
  }

  findOne(id: string) {
    return this.users.find((user) => user.id === id);
  }

  update(id: string, updateUserDto: UpdateUserDto) {
    const userFind = this.findOne(id);

    if (!userFind) {
      throw new ConflictException('El usuario no existe');
    }

    if (
      updateUserDto.username &&
      this.users.some(
        (user) => user.username === updateUserDto.username && user.id !== id,
      )
    ) {
      throw new BadRequestException(
        `El nombre de usuario '${updateUserDto.username}' ya está en uso`,
      );
    }

    const updatedUser: User = {
      ...userFind,
      ...updateUserDto,
      updatedAt: new Date(),
    };

    this.users[userFind.id] = updatedUser;

    writeFileSync(this.filePath, JSON.stringify(this.users, null, 2), 'utf-8');

    const { password: _, ...safeUser } = updatedUser;
    return safeUser;
  }

  changeStatus(id: string, changeUserStatusDto: ChangeUserStatusDto) {
    const userFind = this.findOne(id);

    if (!userFind) {
      throw new ConflictException('El usuario no existe');
    }

    const updatedUser: User = {
      ...userFind,
      isActive: changeUserStatusDto.isActive,
      updatedAt: new Date(),
    };

    this.users[userFind.id] = updatedUser;

    writeFileSync(this.filePath, JSON.stringify(this.users, null, 2), 'utf-8');

    const { password: _, ...safeUser } = updatedUser;

    return {
      message: 'Estado del usuario actualizado correctamente',
      data: safeUser,
    };
  }

  async changePassword(
    id: string,
    changeUserPasswordDto: ChangeUserPasswordDto,
  ) {
    const userFind = this.findOne(id);

    if (!userFind) {
      throw new ConflictException('El usuario no existe');
    }

    const hashedPassword = await argon2.hash(changeUserPasswordDto.password);

    const updatedUser: User = {
      ...userFind,
      password: hashedPassword,
      updatedAt: new Date(),
    };

    this.users[userFind.id] = updatedUser;

    writeFileSync(this.filePath, JSON.stringify(this.users, null, 2), 'utf-8');

    const { password: _, ...safeUser } = updatedUser;

    return {
      message: 'Contraseña actualizada correctamente',
      data: safeUser,
    };
  }
}
