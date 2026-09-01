import type { AuthenticatedUserResponse } from '@sigip/shared';

import type { AuthenticatedUserModel } from '../models/authenticated-user.model';

export function toAuthenticatedUserResponse(
  user: AuthenticatedUserModel,
): AuthenticatedUserResponse {
  return {
    id: user.userId,
    username: user.username,
    fullName: user.fullName,
    office: user.office,
    role: user.role,
    permissions: user.permissions,
  };
}
