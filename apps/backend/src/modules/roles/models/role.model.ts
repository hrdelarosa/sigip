export interface RoleModel {
  id: string;
  code: string;
  name: string;
  description: string | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface PermissionSummaryModel {
  id: string;
  code: string;
  description: string | null;
}

export interface RoleWithPermissionsModel extends RoleModel {
  permissions: PermissionSummaryModel[];
}
