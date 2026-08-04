import type { UserResponse } from '@sigip/shared'
import { toast } from 'sonner'
import { FormDialog } from '@/components/form-dialog'
import { Field, FieldError, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { useValidatedForm } from '@/hooks/useValidatedForm'
import { useChangeUserPassword } from '../hooks/useChangeUserPassword'
import { changeUserPasswordFormSchema } from '../schemas/user-form.schema'

interface Props {
  user: UserResponse
  open: boolean
  onOpenChange: (open: boolean) => void
}

export default function UserPassword({ user, open, onOpenChange }: Props) {
  const passwordMutation = useChangeUserPassword()
  const { register, handleSubmit, errors, reset } = useValidatedForm({
    formSchema: changeUserPasswordFormSchema,
    defaultValues: { password: '', confirmPassword: '' },
    onSubmit: (data) => {
      passwordMutation.mutate(
        { id: user.id, input: { password: data.password } },
        {
          onSuccess: () => {
            reset()
            onOpenChange(false)
            toast.success('Contraseña actualizada', {
              description: `La contraseña de “${user.fullName}” se cambió correctamente.`,
            })
          },
          onError: (error) => {
            toast.error('No se pudo cambiar la contraseña', {
              description: error.message,
            })
          },
        },
      )
    },
  })

  function handleOpenChange(nextOpen: boolean) {
    reset()
    passwordMutation.reset()
    onOpenChange(nextOpen)
  }

  return (
    <FormDialog
      mode="edit"
      module="contraseña"
      description={`Defina una nueva contraseña para ${user.fullName}.`}
      open={open}
      onOpenChange={handleOpenChange}
      onSubmit={handleSubmit}
      isPending={passwordMutation.isPending}
      error={passwordMutation.error}
    >
      <Field data-invalid={!!errors.password}>
        <FieldLabel htmlFor={`user-password-${user.id}`}>
          Nueva contraseña
        </FieldLabel>
        <Input
          {...register('password')}
          id={`user-password-${user.id}`}
          type="password"
          autoComplete="new-password"
          disabled={passwordMutation.isPending}
          aria-invalid={!!errors.password}
          aria-describedby={
            errors.password ? `user-password-${user.id}-error` : undefined
          }
        />
        <FieldError id={`user-password-${user.id}-error`}>
          {errors.password?.message}
        </FieldError>
      </Field>

      <Field data-invalid={!!errors.confirmPassword}>
        <FieldLabel htmlFor={`user-password-confirm-${user.id}`}>
          Confirmar contraseña
        </FieldLabel>
        <Input
          {...register('confirmPassword')}
          id={`user-password-confirm-${user.id}`}
          type="password"
          autoComplete="new-password"
          disabled={passwordMutation.isPending}
          aria-invalid={!!errors.confirmPassword}
          aria-describedby={
            errors.confirmPassword
              ? `user-password-confirm-${user.id}-error`
              : undefined
          }
        />
        <FieldError id={`user-password-confirm-${user.id}-error`}>
          {errors.confirmPassword?.message}
        </FieldError>
      </Field>
    </FormDialog>
  )
}
