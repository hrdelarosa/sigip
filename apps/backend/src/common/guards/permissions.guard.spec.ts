import { ForbiddenException } from '@nestjs/common';

import { PermissionsGuard } from './permissions.guard';

describe('PermissionsGuard', () => {
  it('rejects an authenticated user missing a required permission', () => {
    const reflector = {
      getAllAndOverride: jest.fn().mockReturnValue(['users:update']),
    };
    const guard = new PermissionsGuard(reflector as never);
    const context = {
      getHandler: jest.fn(),
      getClass: jest.fn(),
      switchToHttp: () => ({
        getRequest: () => ({
          authenticatedUser: { permissions: ['users:read'] },
        }),
      }),
    };

    expect(() => guard.canActivate(context as never)).toThrow(
      ForbiddenException,
    );
  });

  it('allows a user with every required permission', () => {
    const reflector = {
      getAllAndOverride: jest
        .fn()
        .mockReturnValue(['users:read', 'users:update']),
    };
    const guard = new PermissionsGuard(reflector as never);
    const context = {
      getHandler: jest.fn(),
      getClass: jest.fn(),
      switchToHttp: () => ({
        getRequest: () => ({
          authenticatedUser: {
            permissions: ['users:read', 'users:update'],
          },
        }),
      }),
    };

    expect(guard.canActivate(context as never)).toBe(true);
  });
});
