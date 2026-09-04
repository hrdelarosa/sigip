export interface CreateOrganizationalUnitData {
  id: string;
  parentId: string | null;
  code: string;
  name: string;
  description?: string | null;
  sortOrder: number;
}

export interface UpdateOrganizationalUnitData {
  parentId?: string | null;
  name?: string;
  description?: string | null;
  sortOrder?: number;
  updatedAt?: Date;
}
