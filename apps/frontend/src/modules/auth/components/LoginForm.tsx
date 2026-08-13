import { LogInIcon } from 'lucide-react'
import { toast } from 'sonner'
import { useLocation } from 'wouter'
import { loginFormSchema } from '../schemas/login-form.schema'

import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Spinner } from '@/components/ui/spinner'
import { PasswordInput } from './PasswordInput'
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from '@/components/ui/field'
import { useValidatedForm } from '@/hooks/useValidatedForm'
import { useLogin } from '../hooks/useLogin'

export default function LoginForm() {
  const [, navigate] = useLocation()
  const loginMutation = useLogin()
  const { register, handleSubmit, errors } = useValidatedForm({
    formSchema: loginFormSchema,
    defaultValues: { username: '', password: '' },
    onSubmit: (input) => {
      loginMutation.mutate(
        { input },
        {
          onSuccess: () => {
            toast.success('Sesión iniciada correctamente')
            navigate(getSafeReturnTo(), { replace: true })
          },
          onError: (error) => {
            toast.error('No se pudo iniciar sesión', {
              description: error.message,
            })
          },
        },
      )
    },
  })

  return (
    <form onSubmit={handleSubmit} noValidate>
      <FieldGroup>
        <Field className="gap-1.5" data-invalid={Boolean(errors.username)}>
          <FieldLabel htmlFor="login-username">Usuario</FieldLabel>
          <Input
            {...register('username')}
            id="login-username"
            autoComplete="username"
            autoFocus
            disabled={loginMutation.isPending}
            aria-invalid={Boolean(errors.username)}
            aria-describedby={
              errors.username ? 'login-username-error' : undefined
            }
          />
          <FieldError id="login-username-error">
            {errors.username?.message}
          </FieldError>
        </Field>

        <PasswordInput
          {...register('password')}
          id="login-password"
          label="Contraseña"
          autoComplete="current-password"
          disabled={loginMutation.isPending}
          error={errors.password?.message}
        />

        <Field>
          <Button
            className="w-full"
            type="submit"
            disabled={loginMutation.isPending}
          >
            {loginMutation.isPending ? (
              <Spinner aria-hidden="true" />
            ) : (
              <LogInIcon aria-hidden="true" />
            )}
            {loginMutation.isPending ? 'Verificando...' : 'Iniciar sesión'}
          </Button>
        </Field>
      </FieldGroup>
    </form>
  )
}

function getSafeReturnTo(): string {
  const returnTo = new URLSearchParams(window.location.search).get('returnTo')

  return returnTo?.startsWith('/') && !returnTo.startsWith('//')
    ? returnTo
    : '/'
}
