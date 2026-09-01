export interface CreatePositionData {
  id: string;
  officeId: string;
  code: string;
  name: string;
  description?: string | null;
}

export interface UpdatePositionData {
  name?: string;
  description?: string | null;
  updatedAt?: Date;
}
