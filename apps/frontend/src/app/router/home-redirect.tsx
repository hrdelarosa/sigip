import { Redirect } from 'wouter'

import { useAuth } from '@/modules/auth'

import { AccessEmptyState } from './access-empty-state'
import { getHomeDestination } from './home-destination'

export function HomeRedirect() {
  const auth = useAuth()
  const destination = getHomeDestination(auth.data?.permissions)

  return destination ? (
    <Redirect to={destination} replace />
  ) : (
    <AccessEmptyState />
  )
}
