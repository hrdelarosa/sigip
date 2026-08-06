export interface CreateOrganizationalUnitData {
  id: string;
  parentId: string;
  code: string;
  name: string;
  description?: string | null;
  sortOrder: number;
}

export interface UpdateOrganizationalUnitData {
  parentId?: string;
  name?: string;
  description?: string | null;
  sortOrder?: number;
  updatedAt?: Date;
}
