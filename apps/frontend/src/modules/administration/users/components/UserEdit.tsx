import type { UpdateUserRequest, UserResponse } from '@sigip/shared'
import { toast } from 'sonner'
import type { Role } from '../../roles/types/roles.types'
import { FormDialog } from '@/components/form-dialog'
import { Field, FieldError, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { useValidatedForm } from '@/hooks/useValidatedForm'
import { useUpdateUser } from '../hooks/useUpdateUser'
import { updateUserFormSchema } from '../schemas/user-form.schema'
import { UserRoleField } from './UserRoleField'
import { UserOfficeField } from './UserOfficeField'
import { useOffices } from '../../offices/hooks/useOffices'

interface Props {
  user: UserResponse
  roles: Role[]
  open: boolean
  onOpenChange: (open: boolean) => void
}

export default function UserEdit({ user, roles, open, onOpenChange }: Props) {
  const updateMutation = useUpdateUser()
  const officesQuery = useOffices()
  const availableRoles = roles.filter(
    (role) => role.isActive || role.id === user.roleId,
  )
  const { register, handleSubmit, errors, reset, setValue, watch } =
    useValidatedForm({
      formSchema: updateUserFormSchema,
      defaultValues: {
        roleId: user.roleId,
        officeId: user.officeId,
        username: user.username,
        fullName: user.fullName,
      },
      onSubmit: (data) => {
        const input: UpdateUserRequest = {}

        if (data.roleId !== user.roleId) input.roleId = data.roleId
        if (data.officeId !== user.officeId) input.officeId = data.officeId
        if (data.username !== user.username) input.username = data.username
        if (data.fullName !== user.fullName) input.fullName = data.fullName

        if (Object.keys(input).length === 0) {
          onOpenChange(false)
          return
        }

        updateMutation.mutate(
          { id: user.id, input },
          {
            onSuccess: (updatedUser) => {
              onOpenChange(false)
              toast.success('Usuario actualizado', {
                description: `Los cambios de “${updatedUser.fullName}” se guardaron.`,
              })
            },
            onError: (error) => {
              toast.error('No se pudo actualizar el usuario', {
                description: error.message,
              })
            },
          },
        )
      },
    })

  function handleOpenChange(nextOpen: boolean) {
    reset({
      roleId: user.roleId,
      officeId: user.officeId,
      username: user.username,
      fullName: user.fullName,
    })
    updateMutation.reset()
    onOpenChange(nextOpen)
  }

  return (
    <FormDialog
      mode="edit"
      module="usuario"
      description="Actualice la identidad de la cuenta o cambie su rol asignado."
      open={open}
      onOpenChange={handleOpenChange}
      onSubmit={handleSubmit}
      isPending={updateMutation.isPending}
      error={updateMutation.error}
    >
      <UserRoleField
        id={`user-role-${user.id}`}
        roles={availableRoles}
        value={watch('roleId')}
        onChange={(roleId) =>
          setValue('roleId', roleId, { shouldValidate: true })
        }
        error={errors.roleId?.message}
        disabled={updateMutation.isPending || roles.length === 0}
      />
      <UserOfficeField
        id={`user-office-${user.id}`}
        offices={(officesQuery.data ?? []).filter((office) => office.isActive || office.id === user.officeId)}
        value={watch('officeId')}
        onChange={(officeId) => setValue('officeId', officeId, { shouldValidate: true })}
        error={errors.officeId?.message}
        disabled={updateMutation.isPending}
      />

      <Field data-invalid={!!errors.username}>
        <FieldLabel htmlFor={`user-username-${user.id}`}>Usuario</FieldLabel>
        <Input
          {...register('username')}
          id={`user-username-${user.id}`}
          autoComplete="off"
          disabled={updateMutation.isPending}
          aria-invalid={!!errors.username}
          aria-describedby={
            errors.username ? `user-username-${user.id}-error` : undefined
          }
        />
        <FieldError id={`user-username-${user.id}-error`}>
          {errors.username?.message}
        </FieldError>
      </Field>

      <Field data-invalid={!!errors.fullName}>
        <FieldLabel htmlFor={`user-full-name-${user.id}`}>
          Nombre completo
        </FieldLabel>
        <Input
          {...register('fullName')}
          id={`user-full-name-${user.id}`}
          autoComplete="name"
          disabled={updateMutation.isPending}
          aria-invalid={!!errors.fullName}
          aria-describedby={
            errors.fullName ? `user-full-name-${user.id}-error` : undefined
          }
        />
        <FieldError id={`user-full-name-${user.id}-error`}>
          {errors.fullName?.message}
        </FieldError>
      </Field>
    </FormDialog>
  )
}
