import { describe, expect, it } from 'vitest'

import { getEmployeePermissions } from './employee-permissions'

describe('getEmployeePermissions', () => {
  it('keeps employee mutations hidden for a data-entry clerk', () => {
    const result = getEmployeePermissions(
      [
        'dashboard:read',
        'employees:read',
        'catalogs:read',
        'incidents:create',
        'incidents:read',
        'documents:create',
        'documents:read',
      ],
      true,
    )

    expect(result).toEqual({
      canCreate: false,
      canUpdate: false,
      canChangeStatus: false,
    })
  })

  it('uses the permission that matches the next employee status', () => {
    expect(
      getEmployeePermissions(['employees:deactivate'], true).canChangeStatus,
    ).toBe(true)
    expect(
      getEmployeePermissions(['employees:deactivate'], false).canChangeStatus,
    ).toBe(false)
    expect(
      getEmployeePermissions(['employees:activate'], false).canChangeStatus,
    ).toBe(true)
  })
})
