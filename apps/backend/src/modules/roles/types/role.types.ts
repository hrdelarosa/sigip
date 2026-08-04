export interface CreateRoleData {
  id: string;
  code: string;
  name: string;
  description?: string | null;
}

export interface UpdateRoleData {
  name?: string;
  description?: string | null;
  updatedAt?: Date;
}
