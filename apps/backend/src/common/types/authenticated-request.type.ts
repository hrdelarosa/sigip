import type { Request } from 'express';
import { AuthenticatedUserModel } from '../../modules/auth/models/authenticated-user.model';

export interface AuthenticatedRequest extends Request {
  authenticatedUser: AuthenticatedUserModel;
}
