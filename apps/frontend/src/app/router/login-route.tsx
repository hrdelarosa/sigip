import { LoginPage, useAuth } from '@/modules/auth'

import { AuthLayout } from '../layouts/AuthLayout'
import { HomeRedirect } from './home-redirect'

export function LoginRoute() {
  const auth = useAuth()

  if (auth.data) return <HomeRedirect />

  return (
    <AuthLayout>
      <LoginPage />
    </AuthLayout>
  )
}
