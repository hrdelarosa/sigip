import { useState, type SubmitEvent } from 'react'
import { CircleAlert, KeyRound } from 'lucide-react'
import type { Role } from '../types/roles.types'

import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Spinner } from '@/components/ui/spinner'
import { Checkbox } from '@/components/ui/checkbox'
import { Skeleton } from '@/components/ui/skeleton'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@/components/ui/empty'
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from '@/components/ui/field'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { useReplaceRolePermissions } from '../hooks/useReplaceRolePermissions'
import { useRolePermissions } from '../hooks/useRolePermissions'
import { usePermissions } from '../../permissions/hooks/usePermissions'

interface Props {
  role: Role
  open: boolean
  onOpenChange: (open: boolean) => void
}

export default function RolePermissionsDialog({
  role,
  open,
  onOpenChange,
}: Props) {
  const [selectionOverride, setSelectionOverride] =
    useState<Set<string> | null>(null)
  const permissionsQuery = usePermissions(open)
  const rolePermissionsQuery = useRolePermissions(open ? role.id : null)
  const replaceMutation = useReplaceRolePermissions()
  const permissions = (permissionsQuery.data ?? []).toSorted((a, b) =>
    a.code.localeCompare(b.code),
  )
  const assignedIds = new Set(
    rolePermissionsQuery.data?.permissions.map((permission) => permission.id) ??
      [],
  )
  const selectedIds = selectionOverride ?? assignedIds
  const currentRole = rolePermissionsQuery.data?.role ?? role
  const isLoading = permissionsQuery.isPending || rolePermissionsQuery.isPending
  const isError = permissionsQuery.isError || rolePermissionsQuery.isError

  function handleCheckedChange(permissionId: string, checked: boolean) {
    const nextSelection = new Set(selectedIds)
    if (checked) nextSelection.add(permissionId)
    else nextSelection.delete(permissionId)
    setSelectionOverride(nextSelection)
  }

  function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault()
    replaceMutation.mutate(
      { id: role.id, input: { permissionIds: [...selectedIds] } },
      {
        onSuccess: () => {
          setSelectionOverride(null)
          onOpenChange(false)
          toast.success('Permisos actualizados', {
            description: `Las asignaciones de “${role.name}” se guardaron.`,
          })
        },
        onError: (error) => {
          toast.error('No se pudieron actualizar los permisos', {
            description: error.message,
          })
        },
      },
    )
  }

  function handleOpenChange(nextOpen: boolean) {
    if (replaceMutation.isPending) return
    setSelectionOverride(null)
    replaceMutation.reset()
    onOpenChange(nextOpen)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Administrar permisos</DialogTitle>
          <DialogDescription>
            Seleccione las acciones permitidas para el rol “{role.name}”.
          </DialogDescription>
        </DialogHeader>

        <form className="flex min-h-0 flex-col gap-5" onSubmit={handleSubmit}>
          {!currentRole.isActive ? (
            <Alert className="border-amber-200 bg-amber-50 text-amber-900">
              <CircleAlert aria-hidden="true" />
              <AlertTitle>Rol inactivo</AlertTitle>
              <AlertDescription>
                Active el rol antes de modificar sus permisos.
              </AlertDescription>
            </Alert>
          ) : null}

          {isError ? (
            <Alert variant="destructive">
              <CircleAlert aria-hidden="true" />
              <AlertTitle>No se pudieron cargar los permisos</AlertTitle>
              <AlertDescription>
                Cierre el diálogo e inténtelo nuevamente.
              </AlertDescription>
            </Alert>
          ) : null}

          {replaceMutation.error ? (
            <Alert variant="destructive">
              <CircleAlert aria-hidden="true" />
              <AlertTitle>No se pudieron guardar los cambios</AlertTitle>
              <AlertDescription>
                {replaceMutation.error.message}
              </AlertDescription>
            </Alert>
          ) : null}

          {isLoading ? (
            <div className="flex flex-col gap-2" aria-hidden="true">
              {Array.from({ length: 5 }, (_, index) => (
                <Skeleton key={index} className="h-14 w-full" />
              ))}
            </div>
          ) : null}

          {!isLoading && !isError ? (
            <ScrollArea className="h-80 rounded-md border p-3">
              {permissions.length > 0 ? (
                <FieldGroup className="gap-2">
                  {permissions.map((permission) => {
                    const fieldId = `role-${role.id}-permission-${permission.id}`
                    return (
                      <Field
                        key={permission.id}
                        orientation="horizontal"
                        data-disabled={!currentRole.isActive}
                        className="rounded-md p-2 hover:bg-muted/50"
                      >
                        <Checkbox
                          id={fieldId}
                          checked={selectedIds.has(permission.id)}
                          disabled={!currentRole.isActive}
                          onCheckedChange={(checked) =>
                            handleCheckedChange(permission.id, checked)
                          }
                        />
                        <FieldContent>
                          <FieldLabel htmlFor={fieldId}>
                            {permission.code}
                          </FieldLabel>
                          <FieldDescription>
                            {permission.description || 'Sin descripción'}
                          </FieldDescription>
                        </FieldContent>
                      </Field>
                    )
                  })}
                </FieldGroup>
              ) : (
                <Empty className="p-6">
                  <EmptyHeader>
                    <EmptyMedia variant="icon">
                      <KeyRound aria-hidden="true" />
                    </EmptyMedia>
                    <EmptyTitle>Sin permisos disponibles</EmptyTitle>
                    <EmptyDescription>
                      Cree permisos antes de asignarlos a este rol.
                    </EmptyDescription>
                  </EmptyHeader>
                </Empty>
              )}
            </ScrollArea>
          ) : null}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              disabled={replaceMutation.isPending}
              onClick={() => handleOpenChange(false)}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={
                replaceMutation.isPending ||
                isLoading ||
                isError ||
                !currentRole.isActive
              }
            >
              {replaceMutation.isPending ? (
                <Spinner
                  data-icon="inline-start"
                  aria-label="Guardando permisos"
                />
              ) : (
                <KeyRound data-icon="inline-start" />
              )}
              {replaceMutation.isPending ? 'Guardando' : 'Guardar permisos'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
