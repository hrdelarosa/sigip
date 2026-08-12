import { LogInIcon } from 'lucide-react'
import { useLocation } from 'wouter'

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Field, FieldError, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Spinner } from '@/components/ui/spinner'
import { useValidatedForm } from '@/hooks/useValidatedForm'
import { useLogin } from '../hooks/useLogin'
import { loginFormSchema } from '../schemas/login-form.schema'

function getSafeReturnTo(): string {
  const returnTo = new URLSearchParams(window.location.search).get('returnTo')
  return returnTo?.startsWith('/') && !returnTo.startsWith('//')
    ? returnTo
    : '/'
}

export function LoginPage() {
  const [, navigate] = useLocation()
  const mutation = useLogin()
  const { register, handleSubmit, errors } = useValidatedForm({
    formSchema: loginFormSchema,
    defaultValues: { username: '', password: '' },
    onSubmit: (input) => {
      mutation.mutate(input, {
        onSuccess: () => navigate(getSafeReturnTo(), { replace: true }),
      })
    },
  })

  return (
    <div>
      <div className="mb-6">
        <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
          Acceso institucional
        </p>
        <h2 className="mt-1 text-xl font-semibold">Iniciar sesión</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Use las credenciales asignadas por el administrador del sistema.
        </p>
      </div>

      {mutation.error ? (
        <Alert variant="destructive" className="mb-5" role="alert">
          <AlertTitle>No fue posible iniciar sesión</AlertTitle>
          <AlertDescription>{mutation.error.message}</AlertDescription>
        </Alert>
      ) : null}

      <form className="space-y-5" onSubmit={handleSubmit} noValidate>
        <Field data-invalid={!!errors.username}>
          <FieldLabel htmlFor="login-username">Usuario</FieldLabel>
          <Input
            {...register('username')}
            id="login-username"
            autoComplete="username"
            autoFocus
            disabled={mutation.isPending}
            aria-invalid={!!errors.username}
            aria-describedby={
              errors.username ? 'login-username-error' : undefined
            }
          />
          <FieldError id="login-username-error">
            {errors.username?.message}
          </FieldError>
        </Field>

        <Field data-invalid={!!errors.password}>
          <FieldLabel htmlFor="login-password">Contraseña</FieldLabel>
          <Input
            {...register('password')}
            id="login-password"
            type="password"
            autoComplete="current-password"
            disabled={mutation.isPending}
            aria-invalid={!!errors.password}
            aria-describedby={
              errors.password ? 'login-password-error' : undefined
            }
          />
          <FieldError id="login-password-error">
            {errors.password?.message}
          </FieldError>
        </Field>

        <Button className="w-full" type="submit" disabled={mutation.isPending}>
          {mutation.isPending ? <Spinner aria-hidden="true" /> : <LogInIcon />}
          {mutation.isPending ? 'Verificando...' : 'Iniciar sesión'}
        </Button>
      </form>
    </div>
  )
}
