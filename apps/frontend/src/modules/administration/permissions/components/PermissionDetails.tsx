import {
  CircleAlert,
  ShieldCheck,
  UserRoundCog,
  UsersRound,
} from 'lucide-react'
import { formatDate } from '@/lib/formatters'
import type { Permission, PermissionDetails } from '../types/permission.types'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { ScrollArea } from '@/components/ui/scroll-area'
import { DetailField } from '@/components/detail-field'
import { PermissionDetailsSkeleton } from './skeletons/PermissionDetailsSkeleton'
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
import { usePermission } from '../hooks/usePermission'

interface Props {
  permission: Permission
  open: boolean
  onOpenChange: (open: boolean) => void
}

export default function PermissionDetails({
  permission,
  open,
  onOpenChange,
}: Props) {
  const permissionQuery = usePermission(open ? permission.id : null)
  const details = permissionQuery.data

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="gap-0 sm:max-w-xl">
        <SheetHeader className="p-6 pr-14">
          <SheetTitle className="text-base font-semibold leading-none">
            Detalles del permiso
          </SheetTitle>
          <SheetDescription>
            Consulta su configuración y alcance dentro de los roles.
          </SheetDescription>
        </SheetHeader>

        <Separator />

        <ScrollArea className="min-h-0 flex-1">
          <div className="flex flex-col gap-4 p-4 sm:p-6">
            {permissionQuery.isPending ? <PermissionDetailsSkeleton /> : null}

            {permissionQuery.isError ? (
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
                    onClick={() => permissionQuery.refetch()}
                  >
                    Reintentar
                  </Button>
                </AlertAction>
              </Alert>
            ) : null}

            {permissionQuery.isSuccess && details ? (
              <>
                <Card>
                  <CardHeader>
                    <CardTitle>
                      <h3>
                        <code className="break-all font-mono text-base">
                          {details.code}
                        </code>
                      </h3>
                    </CardTitle>
                    <CardDescription>
                      {details.description ||
                        'Este permiso no tiene una descripción.'}
                    </CardDescription>

                    <CardAction>
                      <Badge variant="outline">
                        <ShieldCheck
                          data-icon="inline-start"
                          aria-hidden="true"
                        />
                        Permiso
                      </Badge>
                    </CardAction>
                  </CardHeader>

                  <CardContent className="flex flex-col gap-4">
                    <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <DetailField label="Creado en">
                        {formatDate(details.createdAt)}
                      </DetailField>
                      <DetailField label="Asignaciones">
                        {details.assignmentCount === 1
                          ? '1 rol'
                          : `${details.assignmentCount} roles`}
                      </DetailField>
                    </dl>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>
                      <h3>Roles asignados</h3>
                    </CardTitle>
                    <CardDescription>
                      Roles que conceden este permiso a sus usuarios.
                    </CardDescription>

                    <CardAction>
                      <Badge
                        variant="secondary"
                        aria-label={`${details.assignmentCount} roles asignados`}
                      >
                        <UsersRound
                          data-icon="inline-start"
                          aria-hidden="true"
                        />
                        {details.assignmentCount}
                      </Badge>
                    </CardAction>
                  </CardHeader>

                  <CardContent>
                    {details.roles.length > 0 ? (
                      <ItemGroup>
                        {details.roles.map((role) => (
                          <Item
                            key={role.id}
                            variant="outline"
                            size="sm"
                            role="listitem"
                          >
                            <ItemMedia variant="icon">
                              <UserRoundCog aria-hidden="true" />
                            </ItemMedia>

                            <ItemContent>
                              <ItemTitle>{role.name}</ItemTitle>
                              <ItemDescription>{role.code}</ItemDescription>
                            </ItemContent>

                            <Badge
                              variant={role.isActive ? 'secondary' : 'outline'}
                            >
                              {role.isActive ? 'Activo' : 'Inactivo'}
                            </Badge>
                          </Item>
                        ))}
                      </ItemGroup>
                    ) : (
                      <Empty className="border p-6">
                        <EmptyHeader>
                          <EmptyMedia variant="icon">
                            <UsersRound aria-hidden="true" />
                          </EmptyMedia>
                          <EmptyTitle>
                            <h4>Sin roles asignados</h4>
                          </EmptyTitle>
                          <EmptyDescription>
                            Este permiso todavía no forma parte de ningún rol.
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
