import { useState } from 'react'
import { Plus } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Field, FieldError, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { FormDialog } from '@/components/form-dialog'
import { useValidatedForm } from '@/hooks/useValidatedForm'
import { useRoles } from '../../roles/hooks/useRoles'
import { useCreateUser } from '../hooks/useCreateUser'
import { createUserFormSchema } from '../schemas/user-form.schema'
import { UserRoleField } from './UserRoleField'

export default function UserCreate() {
  const [open, setOpen] = useState(false)
  const rolesQuery = useRoles()
  const createMutation = useCreateUser()
  const activeRoles = (rolesQuery.data ?? []).filter((role) => role.isActive)
  const { register, handleSubmit, errors, reset, setValue, watch } =
    useValidatedForm({
      formSchema: createUserFormSchema,
      defaultValues: {
        roleId: '',
        username: '',
        fullName: '',
        password: '',
      },
      onSubmit: (data) => {
        createMutation.mutate(
          { input: data },
          {
            onSuccess: (user) => {
              reset()
              setOpen(false)
              toast.success('Usuario creado', {
                description: `La cuenta de “${user.fullName}” se creó correctamente.`,
              })
            },
            onError: (error) => {
              toast.error('No se pudo crear el usuario', {
                description: error.message,
              })
            },
          },
        )
      },
    })

  function handleOpenChange(nextOpen: boolean) {
    if (!nextOpen) {
      reset()
      createMutation.reset()
    }
    setOpen(nextOpen)
  }

  return (
    <FormDialog
      module="usuario"
      description="Cree la cuenta y asigne uno de los roles activos del sistema."
      trigger={
        <Button
          disabled={
            rolesQuery.isPending ||
            rolesQuery.isError ||
            activeRoles.length === 0
          }
          title={
            rolesQuery.isError
              ? 'No fue posible cargar los roles disponibles'
              : activeRoles.length === 0 && !rolesQuery.isPending
                ? 'No existen roles activos para asignar'
                : undefined
          }
        >
          <Plus data-icon="inline-start" />
          Crear usuario
        </Button>
      }
      open={open}
      onOpenChange={handleOpenChange}
      onSubmit={handleSubmit}
      isPending={createMutation.isPending}
      error={createMutation.error}
    >
      <UserRoleField
        id="user-role"
        roles={activeRoles}
        value={watch('roleId')}
        onChange={(roleId) =>
          setValue('roleId', roleId, { shouldValidate: true })
        }
        error={errors.roleId?.message}
        disabled={createMutation.isPending}
      />

      <Field data-invalid={!!errors.username}>
        <FieldLabel htmlFor="user-username">Usuario</FieldLabel>
        <Input
          {...register('username')}
          id="user-username"
          autoComplete="off"
          placeholder="nombre.usuario"
          disabled={createMutation.isPending}
          aria-invalid={!!errors.username}
          aria-describedby={errors.username ? 'user-username-error' : undefined}
        />
        <FieldError id="user-username-error">
          {errors.username?.message}
        </FieldError>
      </Field>

      <Field data-invalid={!!errors.fullName}>
        <FieldLabel htmlFor="user-full-name">Nombre completo</FieldLabel>
        <Input
          {...register('fullName')}
          id="user-full-name"
          autoComplete="name"
          placeholder="Nombre y apellidos"
          disabled={createMutation.isPending}
          aria-invalid={!!errors.fullName}
          aria-describedby={errors.fullName ? 'user-full-name-error' : undefined}
        />
        <FieldError id="user-full-name-error">
          {errors.fullName?.message}
        </FieldError>
      </Field>

      <Field data-invalid={!!errors.password}>
        <FieldLabel htmlFor="user-password">Contraseña temporal</FieldLabel>
        <Input
          {...register('password')}
          id="user-password"
          type="password"
          autoComplete="new-password"
          disabled={createMutation.isPending}
          aria-invalid={!!errors.password}
          aria-describedby={errors.password ? 'user-password-error' : undefined}
        />
        <FieldError id="user-password-error">
          {errors.password?.message}
        </FieldError>
      </Field>
    </FormDialog>
  )
}
