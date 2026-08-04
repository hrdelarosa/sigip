import { Inject, Injectable } from '@nestjs/common';
import { desc, eq } from 'drizzle-orm';

import type { DrizzleDatabase } from '../../../database/database.types';
import { DRIZZLE_DATABASE } from '../../../database/database.constants';
import { users } from '../../../database/schema';
import { bufferToUuid, uuidToBuffer } from '../../../database/utils/uuid.util';
import { UserModel, UserWithPasswordModel } from '../models/user.model';
import { UsersRepository } from './users.repository';
import { CreateUserData, UpdateUserData } from '../types/user.types';

const publicUserColumns = {
  id: users.id,
  roleId: users.roleId,
  username: users.username,
  fullName: users.fullName,
  isActive: users.isActive,
  lastLoginAt: users.lastLoginAt,
  createdAt: users.createdAt,
  updatedAt: users.updatedAt,
};

type PublicUserRow = Omit<typeof users.$inferSelect, 'password'>;

@Injectable()
export class DrizzleUsersRepository implements UsersRepository {
  constructor(
    @Inject(DRIZZLE_DATABASE)
    private readonly db: DrizzleDatabase,
  ) {}

  private toModel(row: PublicUserRow): UserModel {
    return {
      id: bufferToUuid(row.id),
      roleId: bufferToUuid(row.roleId),
      username: row.username,
      fullName: row.fullName,
      isActive: row.isActive,
      lastLoginAt: row.lastLoginAt,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    };
  }

  async findAll(): Promise<UserModel[]> {
    const rows = await this.db
      .select(publicUserColumns)
      .from(users)
      .orderBy(desc(users.createdAt));

    return rows.map((row) => this.toModel(row));
  }

  async findById(id: string): Promise<UserModel | null> {
    const [row] = await this.db
      .select(publicUserColumns)
      .from(users)
      .where(eq(users.id, uuidToBuffer(id)))
      .limit(1);

    return row ? this.toModel(row) : null;
  }

  async findByIdWithPassword(
    id: string,
  ): Promise<UserWithPasswordModel | null> {
    const [row] = await this.db
      .select()
      .from(users)
      .where(eq(users.id, uuidToBuffer(id)))
      .limit(1);

    return row ? { ...this.toModel(row), passwordHash: row.password } : null;
  }

  async findByUsername(username: string): Promise<UserModel | null> {
    const [row] = await this.db
      .select(publicUserColumns)
      .from(users)
      .where(eq(users.username, username))
      .limit(1);

    return row ? this.toModel(row) : null;
  }

  async create(data: CreateUserData): Promise<UserModel> {
    const values = {
      id: uuidToBuffer(data.id),
      roleId: uuidToBuffer(data.roleId),
      username: data.username,
      fullName: data.fullName,
      password: data.passwordHash,
      isActive: true,
    } satisfies typeof users.$inferInsert;

    await this.db.insert(users).values(values);

    const user = await this.findById(data.id);

    if (!user) throw new Error('No fue posible recuperar el usuario creado');

    return user;
  }

  async update(id: string, data: UpdateUserData): Promise<UserModel | null> {
    const values: Partial<typeof users.$inferInsert> = {
      updatedAt: data.updatedAt,
    };

    if (data.roleId !== undefined) values.roleId = uuidToBuffer(data.roleId);
    if (data.username !== undefined) values.username = data.username;
    if (data.fullName !== undefined) values.fullName = data.fullName;

    await this.db
      .update(users)
      .set(values)
      .where(eq(users.id, uuidToBuffer(id)));

    return this.findById(id);
  }

  async updateStatus(
    id: string,
    isActive: boolean,
    updatedAt?: Date,
  ): Promise<UserModel | null> {
    await this.db
      .update(users)
      .set({ isActive, updatedAt })
      .where(eq(users.id, uuidToBuffer(id)));

    return this.findById(id);
  }

  async updatePassword(
    id: string,
    passwordHash: string,
    updatedAt: Date,
  ): Promise<UserModel | null> {
    await this.db
      .update(users)
      .set({ password: passwordHash, updatedAt })
      .where(eq(users.id, uuidToBuffer(id)));

    return this.findById(id);
  }
}
