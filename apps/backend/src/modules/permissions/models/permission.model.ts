export interface PermissionModel {
  id: string;
  code: string;
  description: string | null;
  createdAt: Date;
}

export interface PermissionRoleModel {
  id: string;
  code: string;
  name: string;
  isActive: boolean;
}

export interface PermissionDetailsModel extends PermissionModel {
  assignmentCount: number;
  roles: PermissionRoleModel[];
}
