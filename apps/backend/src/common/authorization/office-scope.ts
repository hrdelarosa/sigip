import { AuthenticatedUserModel } from '../../modules/auth/models/authenticated-user.model';

export const ACCESS_ALL_OFFICES_PERMISSION = 'offices:access-all';
export interface OfficeScope {
  officeId: string;
  canAccessAllOffices: boolean;
}

export function getOfficeScope(actor: AuthenticatedUserModel): OfficeScope {
  return {
    officeId: actor.office.id,
    canAccessAllOffices: actor.permissions.includes(
      ACCESS_ALL_OFFICES_PERMISSION,
    ),
  };
}

export function canAccessOffice(scope: OfficeScope, officeId: string): boolean {
  return scope.canAccessAllOffices || scope.officeId === officeId;
}
