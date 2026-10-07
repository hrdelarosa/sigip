import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import type { AuthenticatedRequest } from '../../common/types/authenticated-request.type';

@Injectable()
export class EmployeeOfficeOptionsGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const actor = context
      .switchToHttp()
      .getRequest<AuthenticatedRequest>().authenticatedUser;
    if (
      !actor.permissions.includes('employees:create') &&
      !actor.permissions.includes('employees:update')
    ) {
      throw new ForbiddenException(
        'Se requiere employees:create o employees:update',
      );
    }
    return true;
  }
}
