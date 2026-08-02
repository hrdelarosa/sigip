import { Injectable } from '@nestjs/common';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { RolesRepository } from './repositories/roles.repository';
import { UpdateRoleStatusDto } from './dto/update-role-status.dto';
import { ReplaceRolePermissionsDto } from './dto/replace-role-permissions.dto';
import {
  InactiveRoleError,
  InvalidPermissionError,
  RoleCodeAlreadyExistsError,
  RoleHasAssignedUsersError,
  RoleNotFoundError,
} from './roles.errors';
import { generateUuidV7 } from '../../common/utils/generate-uuid-v7.util';

@Injectable()
export class RolesService {
  constructor(private readonly roleRepository: RolesRepository) {}

  private normalizeDescription(description?: string | null): string | null {
    if (!description) return null;

    const normalized = description.trim();

    return normalized.length > 0 ? normalized : null;
  }

  async findAll() {
    return await this.roleRepository.findAll();
  }

  async findById(id: string) {
    const role = await this.roleRepository.findById(id);

    if (!role) throw new RoleNotFoundError();

    return role;
  }

  async create(dto: CreateRoleDto) {
    const normalizedCode = dto.code.trim().toUpperCase();
    const existingRole = await this.roleRepository.findByCode(normalizedCode);

    if (existingRole) throw new RoleCodeAlreadyExistsError();

    return this.roleRepository.create({
      id: generateUuidV7(),
      code: normalizedCode,
      name: dto.name.trim(),
      description: this.normalizeDescription(dto.description),
    });
  }

  async update(id: string, dto: UpdateRoleDto) {
    await this.findById(id);

    const updatedRole = await this.roleRepository.update(id, {
      name: dto.name !== undefined ? dto.name.trim() : undefined,
      description:
        dto.description !== undefined
          ? this.normalizeDescription(dto.description)
          : undefined,
      updatedAt: new Date(),
    });

    if (!updatedRole) throw new RoleNotFoundError();

    return updatedRole;
  }

  async updateStatus(id: string, dto: UpdateRoleStatusDto) {
    const role = await this.findById(id);

    if (role.isActive === dto.isActive) return role;

    if (!dto.isActive) {
      const assignedUsers = await this.roleRepository.countUsersByRoleId(id);

      if (assignedUsers > 0) throw new RoleHasAssignedUsersError();
    }

    const updatedRole = await this.roleRepository.updateStatus(
      id,
      dto.isActive,
      new Date(),
    );

    if (!updatedRole) throw new RoleNotFoundError();

    return updatedRole;
  }

  async findPermissions(id: string) {
    const role = await this.findById(id);
    const permissions = await this.roleRepository.findPermissions(id);

    return {
      role,
      permissions,
    };
  }

  async replacePermissions(id: string, dto: ReplaceRolePermissionsDto) {
    const role = await this.findById(id);

    if (!role.isActive) throw new InactiveRoleError();

    const existingPermissions =
      await this.roleRepository.countExistingPermissions(dto.permissionIds);

    if (existingPermissions !== dto.permissionIds.length)
      throw new InvalidPermissionError();

    await this.roleRepository.replacePermissions(id, dto.permissionIds);

    return this.roleRepository.findPermissions(id);
  }
}
