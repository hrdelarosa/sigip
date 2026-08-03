import {
  PermissionModel,
  PermissionRoleModel,
} from '../models/permission.model';

export interface CreatePermissionData {
  id: string;
  code: string;
  description?: string | null;
}

export interface UpdatePermissionData {
  description?: string | null;
}

export abstract class PermissionsRepository {
  abstract findAll(): Promise<PermissionModel[]>;
  abstract findById(id: string): Promise<PermissionModel | null>;
  abstract findRolesByPermissionId(id: string): Promise<PermissionRoleModel[]>;
  abstract findByCode(code: string): Promise<PermissionModel | null>;
  abstract create(data: CreatePermissionData): Promise<PermissionModel>;
  abstract update(
    id: string,
    data: UpdatePermissionData,
  ): Promise<PermissionModel | null>;
}
