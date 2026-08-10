import { formatDate } from '@/lib/formatters'

import { Skeleton } from '@/components/ui/skeleton'
import { Separator } from '@/components/ui/separator'
import { ScrollArea } from '@/components/ui/scroll-area'
import { StatusBadge } from '@/components/status-badge'
import { DetailField } from '@/components/detail-field'
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
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { useOrganizationalUnit } from '../hooks/useOrganizationalUnit'

interface Props {
  organizationalUnitId: string
  open: boolean
  onOpenChange: (open: boolean) => void
}

export default function OrganizationalUnitDetails({
  organizationalUnitId,
  open,
  onOpenChange,
}: Props) {
  const organizationalUnitQuery = useOrganizationalUnit(
    open ? organizationalUnitId : null,
  )
  const details = organizationalUnitQuery.data

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="gap-0">
        <SheetHeader className="p-6 pr-14">
          <SheetTitle className="text-base font-semibold leading-none">
            Detalles de la unidad organizacional
          </SheetTitle>
          <SheetDescription>
            Consulta la información y estructura de esta unidad.
          </SheetDescription>
        </SheetHeader>

        <Separator />

        <ScrollArea className="min-h-0 flex-1">
          <div className="flex flex-col gap-4 p-4 sm:p-6">
            {organizationalUnitQuery.isPending ? <Skeleton /> : null}

            {organizationalUnitQuery.isError ? (
              <DetailsErrorAlert
                itemType="unidad organizacional"
                onRetry={() => organizationalUnitQuery.refetch()}
                isPending={organizationalUnitQuery.isPending}
              />
            ) : null}

            {organizationalUnitQuery.isSuccess && details ? (
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

                    <CardAction>
                      <StatusBadge isActive={details.isActive} />
                    </CardAction>
                  </CardHeader>

                  <CardContent className="flex flex-col gap-4">
                    <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <DetailField label="Nombre" className="col-span-2">
                        {details.name ??
                          'Esta unidad organizacional no tiene un nombre.'}
                      </DetailField>

                      <DetailField label="Descripción" className="col-span-2">
                        {details.description ||
                          'Esta unidad organizacional no tiene una descripción.'}
                      </DetailField>

                      <DetailField label="Creado en">
                        {formatDate(details.createdAt)}
                      </DetailField>

                      <DetailField label="Actualizado en">
                        {formatDate(details.updatedAt)}
                      </DetailField>
                    </dl>
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
