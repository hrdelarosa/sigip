import { BriefcaseBusiness, IdCard, IdCardLanyard } from 'lucide-react'
import { formatDate } from '@/lib/formatters'

import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Separator } from '@/components/ui/separator'
import { ScrollArea } from '@/components/ui/scroll-area'
import { DetailField } from '@/components/detail-field'
import { DetailsEmpty } from '@/components/details/details-empty'
import { DetailsErrorAlert } from '@/components/details/details-error-alert'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
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
import { usePosition } from '../hooks/usePosition'
import { StatusBadge } from '@/components/status-badge'
import { Link } from 'wouter'
import { routes } from '@/app/router/routes'

interface Props {
  positionId: string
  open: boolean
  onOpenChange: (open: boolean) => void
}

export default function PositionDetails({
  positionId,
  open,
  onOpenChange,
}: Props) {
  const positionQuery = usePosition(open ? positionId : null)
  const details = positionQuery.data

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="gap-0">
        <SheetHeader className="p-6 pr-14">
          <SheetTitle className="text-base font-semibold leading-none">
            Detalles del puesto
          </SheetTitle>
          <SheetDescription>
            Consulta la información del puesto y su configuración.
          </SheetDescription>
        </SheetHeader>

        <Separator />

        <ScrollArea className="min-h-0 flex-1">
          <div className="flex flex-col gap-4 p-4 sm:p-6">
            {positionQuery.isPending ? <Skeleton /> : null}

            {positionQuery.isError ? (
              <DetailsErrorAlert
                itemType="puesto"
                onRetry={() => positionQuery.refetch()}
                isPending={positionQuery.isPending}
              />
            ) : null}

            {positionQuery.isSuccess && details ? (
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
                        <BriefcaseBusiness
                          data-icon="inline-start"
                          aria-hidden="true"
                        />
                        Puesto
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
                          ? '1 empleado'
                          : `${details.assignmentCount} empleados`}
                      </DetailField>
                    </dl>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>
                      <h3>Empleados asignados</h3>
                    </CardTitle>
                    <CardDescription>
                      Empleados que ocupan actualmente este puesto.
                    </CardDescription>

                    <CardAction>
                      <Badge
                        variant="secondary"
                        aria-label={`${details.assignmentCount} empleados asignados`}
                      >
                        <IdCard data-icon="inline-start" aria-hidden="true" />
                        {details.assignmentCount}
                      </Badge>
                    </CardAction>
                  </CardHeader>

                  <CardContent>
                    {details.employees.length > 0 ? (
                      <ItemGroup>
                        {details.employees.map((employee) => (
                          <Item
                            key={employee.id}
                            variant="outline"
                            size="sm"
                            role="listitem"
                          >
                            <ItemMedia variant="icon">
                              <IdCardLanyard aria-hidden="true" />
                            </ItemMedia>

                            <ItemContent>
                              <ItemTitle>
                                <Link
                                  href={routes.employees.detail(employee.id)}
                                  className="underline-offset-4 hover:underline"
                                >
                                  {employee.employeeNumber}
                                </Link>
                              </ItemTitle>
                              <ItemDescription>
                                {employee.fullName}
                              </ItemDescription>
                            </ItemContent>

                            <StatusBadge
                              isActive={
                                employee.status === 'ACTIVE' ? true : false
                              }
                            />
                          </Item>
                        ))}
                      </ItemGroup>
                    ) : (
                      <DetailsEmpty
                        itemType="empleados"
                        media={<IdCardLanyard aria-hidden="true" />}
                      />
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
