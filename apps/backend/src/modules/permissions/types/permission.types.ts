export interface CreatePermissionData {
  id: string;
  code: string;
  description?: string | null;
}

export interface UpdatePermissionData {
  description?: string | null;
}

export type DeletePermissionResult =
  'deleted' | 'not-found' | 'has-assigned-roles';
