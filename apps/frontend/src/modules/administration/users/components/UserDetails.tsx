import type { UserResponse } from '@sigip/shared'
import { CircleAlert, UserRound } from 'lucide-react'
import type { Role } from '../../roles/types/roles.types'
import {
  Alert,
  AlertAction,
  AlertDescription,
  AlertTitle,
} from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { Skeleton } from '@/components/ui/skeleton'
import { DetailField } from '@/components/detail-field'
import { StatusBadge } from '@/components/status-badge'
import { formatDate } from '@/lib/formatters'
import { useUser } from '../hooks/useUser'

interface Props {
  user: UserResponse
  roles: Role[]
  open: boolean
  onOpenChange: (open: boolean) => void
}

export default function UserDetails({ user, roles, open, onOpenChange }: Props) {
  const userQuery = useUser(open ? user.id : null)
  const details = userQuery.data
  const role = roles.find((item) => item.id === details?.roleId)

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="gap-0">
        <SheetHeader className="p-6 pr-14">
          <SheetTitle className="text-base font-semibold leading-none">
            Detalles del usuario
          </SheetTitle>
          <SheetDescription>
            Consulte la identidad, el rol y la actividad de esta cuenta.
          </SheetDescription>
        </SheetHeader>

        <Separator />

        <ScrollArea className="min-h-0 flex-1">
          <div className="flex flex-col gap-4 p-4 sm:p-6">
            {userQuery.isPending ? (
              <Card>
                <CardHeader>
                  <Skeleton className="h-5 w-48" />
                  <Skeleton className="h-4 w-32" />
                </CardHeader>
                <CardContent className="grid grid-cols-2 gap-4">
                  {Array.from({ length: 6 }).map((_, index) => (
                    <Skeleton key={index} className="h-12 w-full" />
                  ))}
                </CardContent>
              </Card>
            ) : null}

            {userQuery.isError ? (
              <Alert variant="destructive">
                <CircleAlert aria-hidden="true" />
                <AlertTitle>No se pudieron cargar los detalles</AlertTitle>
                <AlertDescription>
                  Compruebe la conexión e inténtelo nuevamente.
                </AlertDescription>
                <AlertAction>
                  <Button
                    variant="outline"
                    size="xs"
                    onClick={() => userQuery.refetch()}
                  >
                    Reintentar
                  </Button>
                </AlertAction>
              </Alert>
            ) : null}

            {userQuery.isSuccess && details ? (
              <Card>
                <CardHeader>
                  <CardTitle>
                    <h3>{details.fullName}</h3>
                  </CardTitle>
                  <CardDescription>@{details.username}</CardDescription>
                  <CardAction>
                    <StatusBadge isActive={details.isActive} icon />
                  </CardAction>
                </CardHeader>
                <CardContent>
                  <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <DetailField label="Rol">
                      {role?.name ?? 'Rol no disponible'}
                    </DetailField>
                    <DetailField label="Código del rol">
                      {role?.code ?? 'Sin información'}
                    </DetailField>
                    <DetailField label="Último acceso">
                      {details.lastLoginAt
                        ? formatDate(details.lastLoginAt)
                        : 'Nunca'}
                    </DetailField>
                    <DetailField label="Creado en">
                      {formatDate(details.createdAt)}
                    </DetailField>
                    <DetailField label="Actualizado en">
                      {formatDate(details.updatedAt)}
                    </DetailField>
                    <DetailField label="Identificador">
                      <span className="inline-flex items-center gap-2 font-mono text-xs">
                        <UserRound aria-hidden="true" />
                        {details.id}
                      </span>
                    </DetailField>
                  </dl>
                </CardContent>
              </Card>
            ) : null}
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  )
}
