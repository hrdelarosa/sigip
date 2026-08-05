import { Injectable } from '@nestjs/common';
import { CreatePermissionDto } from './dto/create-permission.dto';
import { UpdatePermissionDto } from './dto/update-permission.dto';
import { PermissionsRepository } from './repositories/permissions.repository';
import { PermissionDetailsModel } from './models/permission.model';
import {
  PermissionCodeAlreadyExistsError,
  PermissionHasAssignedRolesError,
  PermissionNotFoundError,
} from './permissions.errors';
import { generateUuidV7 } from '../../common/utils/generate-uuid-v7.util';
import { hasMysqlErrorCode } from '../../database/utils/mysql-error.util';

@Injectable()
export class PermissionsService {
  constructor(private readonly permissionsRepository: PermissionsRepository) {}

  private normalizeDescription(description?: string | null): string | null {
    if (!description) return null;

    const normalized = description.trim();

    return normalized.length > 0 ? normalized : null;
  }

  async findAll() {
    return await this.permissionsRepository.findAll();
  }

  async findById(id: string): Promise<PermissionDetailsModel> {
    const permission = await this.permissionsRepository.findById(id);

    if (!permission) throw new PermissionNotFoundError();

    const roles = await this.permissionsRepository.findRolesByPermissionId(id);

    return {
      ...permission,
      assignmentCount: roles.length,
      roles,
    };
  }

  async create(dto: CreatePermissionDto) {
    const normalizedCode = dto.code.trim().toLowerCase();
    const existingPermission =
      await this.permissionsRepository.findByCode(normalizedCode);

    if (existingPermission) throw new PermissionCodeAlreadyExistsError();

    try {
      return await this.permissionsRepository.create({
        id: generateUuidV7(),
        code: normalizedCode,
        description: this.normalizeDescription(dto.description),
      });
    } catch (error) {
      if (hasMysqlErrorCode(error, 'ER_DUP_ENTRY')) {
        throw new PermissionCodeAlreadyExistsError();
      }

      throw error;
    }
  }

  async update(id: string, dto: UpdatePermissionDto) {
    const existingPermission = await this.permissionsRepository.findById(id);

    if (!existingPermission) throw new PermissionNotFoundError();

    const permission = await this.permissionsRepository.update(id, {
      description:
        dto.description !== undefined
          ? this.normalizeDescription(dto.description)
          : undefined,
    });

    if (!permission) throw new PermissionNotFoundError();

    return permission;
  }

  async delete(id: string) {
    const result = await this.permissionsRepository.delete(id);

    if (result === 'not-found') throw new PermissionNotFoundError();
    if (result === 'has-assigned-roles')
      throw new PermissionHasAssignedRolesError();
  }
}
