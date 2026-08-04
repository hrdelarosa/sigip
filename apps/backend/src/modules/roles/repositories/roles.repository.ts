import { PermissionSummaryModel, RoleModel } from '../models/role.model';
import { CreateRoleData, UpdateRoleData } from '../types/role.types';

export abstract class RolesRepository {
  abstract findAll(): Promise<RoleModel[]>;
  abstract findById(id: string): Promise<RoleModel | null>;
  abstract findByCode(code: string): Promise<RoleModel | null>;
  abstract create(data: CreateRoleData): Promise<RoleModel>;
  abstract update(id: string, data: UpdateRoleData): Promise<RoleModel | null>;
  abstract updateStatus(
    id: string,
    isActive: boolean,
    updatedAt: Date,
  ): Promise<RoleModel | null>;
  abstract countUsersByRoleId(roleId: string): Promise<number>;
  abstract findPermissions(roleId: string): Promise<PermissionSummaryModel[]>;
  abstract countExistingPermissions(permissionIds: string[]): Promise<number>;
  abstract replacePermissions(
    roleId: string,
    permissionIds: string[],
  ): Promise<void>;
}
