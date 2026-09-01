export interface OrganizationalUnitsModel {
  id: string;
  officeId: string;
  parentId: string | null;
  code: string;
  name: string;
  description: string | null;
  isActive: boolean;
  sortOrder: number;
  createdAt: Date;
  updatedAt: Date;
}
