import { OfficeResponse } from '@sigip/shared';
import { OfficeModel } from '../models/office.model';

export function toOfficeResponse(office: OfficeModel): OfficeResponse {
  return {
    id: office.id,
    code: office.code,
    name: office.name,
    description: office.description,
    municipality: office.municipality,
    address: office.address,
    isActive: office.isActive,
    sortOrder: office.sortOrder,
    createdAt: office.createdAt.toISOString(),
    updatedAt: office.updatedAt.toISOString(),
  };
}
