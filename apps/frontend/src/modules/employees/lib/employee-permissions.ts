import { hasPermission } from '@/modules/auth'

export function getEmployeePermissions(
  permissions: readonly string[] | undefined,
  isActive: boolean | undefined,
) {
  return {
    canCreate: hasPermission(permissions, 'employees:create'),
    canUpdate: hasPermission(permissions, 'employees:update'),
    canChangeStatus:
      isActive === undefined
        ? false
        : hasPermission(
            permissions,
            isActive ? 'employees:deactivate' : 'employees:activate',
          ),
  }
}
