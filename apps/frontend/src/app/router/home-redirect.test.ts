import { describe, expect, it } from 'vitest'

import { getHomeDestination } from './home-destination'

describe('getHomeDestination', () => {
  it('selects the first section the authenticated user can access', () => {
    expect(
      getHomeDestination(['incidents:read', 'employees:read']),
    ).toBe('/incidents')
  })

  it('returns null when the authenticated user has no readable section', () => {
    expect(getHomeDestination([])).toBeNull()
  })
})
