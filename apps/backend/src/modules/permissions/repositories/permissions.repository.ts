import {
  PermissionModel,
  PermissionRoleModel,
} from '../models/permission.model';
import {
  CreatePermissionData,
  DeletePermissionResult,
  UpdatePermissionData,
} from '../types/permission.types';

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
  abstract delete(id: string): Promise<DeletePermissionResult>;
}
