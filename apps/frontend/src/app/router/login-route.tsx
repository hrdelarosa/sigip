import { Redirect } from 'wouter'

import { LoginPage, useAuth } from '@/modules/auth'

import { AuthLayout } from '../layouts/AuthLayout'
import { routes } from './routes'

export function LoginRoute() {
  const auth = useAuth()

  if (auth.data) return <Redirect to={routes.home} replace />

  return (
    <AuthLayout>
      <LoginPage />
    </AuthLayout>
  )
}
