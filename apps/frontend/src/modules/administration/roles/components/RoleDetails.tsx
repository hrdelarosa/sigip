import { CircleAlert, KeyRound } from 'lucide-react'
import { formatDate } from '@/lib/formatters'
import type { Role } from '../types/roles.types'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { ScrollArea } from '@/components/ui/scroll-area'
import { StatusBadge } from '@/components/status-badge'
import { DetailField } from '@/components/detail-field'
import { RoleDetailsSkeleton } from './skeletons/RoleDetailsSkeleton'
import {
  Alert,
  AlertAction,
  AlertDescription,
  AlertTitle,
} from '@/components/ui/alert'
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@/components/ui/empty'
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Item,
  ItemContent,
  ItemDescription,
  ItemGroup,
  ItemMedia,
  ItemTitle,
} from '@/components/ui/item'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { useRolePermissions } from '../hooks/useRolePermissions'

interface Props {
  role: Role
  open: boolean
  onOpenChange: (open: boolean) => void
}

export default function RoleDetails({ role, open, onOpenChange }: Props) {
  const roleQuery = useRolePermissions(open ? role.id : null)
  const details = roleQuery.data

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="gap-0">
        <SheetHeader className="p-6 pr-14">
          <SheetTitle className="text-base font-semibold leading-none">
            Detalles del rol
          </SheetTitle>
          <SheetDescription>
            Consulta la configuración y los permisos asignados al rol.
          </SheetDescription>
        </SheetHeader>

        <Separator />

        <ScrollArea className="min-h-0 flex-1">
          <div className="flex flex-col gap-4 p-4 sm:p-6">
            {roleQuery.isPending ? <RoleDetailsSkeleton /> : null}

            {roleQuery.isError ? (
              <Alert variant="destructive">
                <CircleAlert aria-hidden="true" />
                <AlertTitle>No se pudieron cargar los detalles</AlertTitle>
                <AlertDescription>
                  Comprueba la conexión e inténtalo nuevamente.
                </AlertDescription>
                <AlertAction>
                  <Button
                    variant="outline"
                    size="xs"
                    onClick={() => roleQuery.refetch()}
                  >
                    Reintentar
                  </Button>
                </AlertAction>
              </Alert>
            ) : null}

            {roleQuery.isSuccess && details ? (
              <>
                <Card>
                  <CardHeader>
                    <CardTitle>
                      <h3>{details.role.name}</h3>
                    </CardTitle>
                    <CardDescription>
                      {details.role.description ||
                        'Este rol no tiene una descripción.'}
                    </CardDescription>
                    <CardAction>
                      <StatusBadge isActive={details.role.isActive} icon />
                    </CardAction>
                  </CardHeader>
                  <CardContent>
                    <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <DetailField label="Código" className="col-span-2">
                        <code className="font-mono">{details.role.code}</code>
                      </DetailField>
                      <DetailField label="Permisos">
                        {details.permissions.length === 1
                          ? '1 permiso'
                          : `${details.permissions.length} permisos`}
                      </DetailField>
                      <DetailField label="Creado en">
                        {formatDate(details.role.createdAt)}
                      </DetailField>
                      <DetailField label="Actualizado en">
                        {formatDate(details.role.updatedAt)}
                      </DetailField>
                    </dl>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>
                      <h3>Permisos asignados</h3>
                    </CardTitle>
                    <CardDescription>
                      Acciones que pueden realizar los usuarios con este rol.
                    </CardDescription>
                    <CardAction>
                      <Badge variant="secondary">
                        <KeyRound data-icon="inline-start" aria-hidden="true" />
                        {details.permissions.length}
                      </Badge>
                    </CardAction>
                  </CardHeader>
                  <CardContent>
                    {details.permissions.length > 0 ? (
                      <ItemGroup>
                        {details.permissions.map((permission) => (
                          <Item
                            key={permission.id}
                            variant="outline"
                            size="sm"
                            role="listitem"
                          >
                            <ItemMedia variant="icon">
                              <KeyRound aria-hidden="true" />
                            </ItemMedia>
                            <ItemContent>
                              <ItemTitle>{permission.code}</ItemTitle>
                              <ItemDescription>
                                {permission.description || 'Sin descripción'}
                              </ItemDescription>
                            </ItemContent>
                          </Item>
                        ))}
                      </ItemGroup>
                    ) : (
                      <Empty className="border p-6">
                        <EmptyHeader>
                          <EmptyMedia variant="icon">
                            <KeyRound aria-hidden="true" />
                          </EmptyMedia>
                          <EmptyTitle>
                            <h4>Sin permisos asignados</h4>
                          </EmptyTitle>
                          <EmptyDescription>
                            Este rol todavía no concede ninguna acción.
                          </EmptyDescription>
                        </EmptyHeader>
                      </Empty>
                    )}
                  </CardContent>
                </Card>
              </>
            ) : null}
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  )
}
