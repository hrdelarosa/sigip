import type { OrganizationalUnitResponse } from '@sigip/shared';
import { OrganizationalUnitsModel } from '../models/organizational-units.model';

export function toOrganizationalUnitsResponse(
  organizationalUnit: OrganizationalUnitsModel,
): OrganizationalUnitResponse {
  return {
    id: organizationalUnit.id,
    parentId: organizationalUnit.parentId,
    code: organizationalUnit.code,
    name: organizationalUnit.name,
    description: organizationalUnit.description ?? null,
    isActive: organizationalUnit.isActive,
    sortOrder: organizationalUnit.sortOrder,
    createdAt: organizationalUnit.createdAt.toISOString(),
    updatedAt: organizationalUnit.updatedAt.toISOString(),
  };
}
