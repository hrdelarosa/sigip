import type { PropsWithChildren } from 'react'

import { AppLayout } from '../layouts/AppLayout'
import { ProtectedRoute } from './protected-route'

export function ProtectedPage({
  children,
  permission,
  permissions,
}: PropsWithChildren<{
  permission?: string
  permissions?: readonly string[]
}>) {
  return (
    <ProtectedRoute permission={permission} permissions={permissions}>
      <AppLayout>{children}</AppLayout>
    </ProtectedRoute>
  )
}
