export interface OfficeModel {
  id: string;
  code: string;
  name: string;
  description: string | null;
  municipality: string | null;
  address: string | null;
  isActive: boolean;
  sortOrder: number;
  createdAt: Date;
  updatedAt: Date;
}
