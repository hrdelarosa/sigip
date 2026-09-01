import {
  Building2Icon,
  CalendarDaysIcon,
  CircleAlert,
  HashIcon,
  MapPinIcon,
} from 'lucide-react'
import type { Office } from '../types/office.types'
import { useOffice } from '../hooks/useOffice'
import { formatDate } from '@/lib/formatters'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Alert,
  AlertAction,
  AlertDescription,
  AlertTitle,
} from '@/components/ui/alert'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'

interface Props {
  office: Office
  open: boolean
  onOpenChange: (open: boolean) => void
}

export default function OfficeDetails({ office, open, onOpenChange }: Props) {
  const query = useOffice(open ? office.id : null)
  const details = query.data

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="gap-0 p-0 sm:max-w-xl">
        <SheetHeader className="border-b bg-muted/20 p-6 pr-14">
          <div className="flex items-start gap-4">
            <div className="flex size-12 shrink-0 items-center justify-center rounded-xl border bg-background text-primary shadow-sm">
              <Building2Icon className="size-6" aria-hidden="true" />
            </div>
            <div className="min-w-0 space-y-1">
              <SheetTitle className="text-lg leading-tight">
                {office.name}
              </SheetTitle>
              <SheetDescription>
                Información de la oficina en el catálogo institucional.
              </SheetDescription>
            </div>
          </div>
        </SheetHeader>

        <ScrollArea className="min-h-0 flex-1">
          <div className="flex flex-col gap-4 p-4 sm:p-6">
            {query.isPending ? (
              <div
                className="min-h-64 animate-pulse rounded-xl bg-muted"
                aria-label="Cargando detalles"
                aria-busy="true"
              />
            ) : null}

            {query.isError ? (
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
                    onClick={() => query.refetch()}
                  >
                    Reintentar
                  </Button>
                </AlertAction>
              </Alert>
            ) : null}

            {query.isSuccess && details ? (
              <>
                <Card className="overflow-hidden">
                  <CardHeader className="border-b bg-muted/10 pb-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="space-y-1">
                        <CardDescription className="text-xs font-semibold uppercase tracking-wider">
                          Identificación
                        </CardDescription>
                        <CardTitle className="text-xl leading-tight">
                          {details.name}
                        </CardTitle>
                      </div>
                      <Badge
                        variant={details.isActive ? 'default' : 'secondary'}
                        className="shrink-0"
                      >
                        {details.isActive ? 'Activa' : 'Inactiva'}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="grid gap-4 pt-5 sm:grid-cols-2">
                    <div className="flex items-start gap-3">
                      <HashIcon
                        className="mt-0.5 size-4 text-muted-foreground"
                        aria-hidden="true"
                      />
                      <div className="min-w-0">
                        <p className="text-xs font-medium text-muted-foreground">
                          Código de oficina
                        </p>
                        <p className="mt-1 break-all font-mono text-sm font-semibold">
                          {details.code}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <MapPinIcon
                        className="mt-0.5 size-4 text-muted-foreground"
                        aria-hidden="true"
                      />
                      <div className="min-w-0">
                        <p className="text-xs font-medium text-muted-foreground">
                          Municipio
                        </p>
                        <p className="mt-1 text-sm font-semibold">
                          {details.municipality || 'Sin municipio registrado'}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Ubicación</CardTitle>
                    <CardDescription>
                      Domicilio registrado para esta oficina.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex gap-3 rounded-lg border bg-muted/20 p-4">
                      <MapPinIcon
                        className="mt-0.5 size-5 shrink-0 text-primary"
                        aria-hidden="true"
                      />
                      <p className="text-sm leading-6">
                        {details.address || 'Sin domicilio registrado'}
                      </p>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Descripción</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm leading-6 text-muted-foreground">
                      {details.description ||
                        'Esta oficina no tiene una descripción registrada.'}
                    </p>
                  </CardContent>
                </Card>

                <div className="grid gap-3 rounded-lg border bg-muted/10 p-4 sm:grid-cols-2">
                  <div className="flex items-center gap-3">
                    <CalendarDaysIcon
                      className="size-4 text-muted-foreground"
                      aria-hidden="true"
                    />
                    <div>
                      <p className="text-xs text-muted-foreground">
                        Registrada en
                      </p>
                      <p className="text-sm font-medium">
                        {formatDate(details.createdAt)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <CalendarDaysIcon
                      className="size-4 text-muted-foreground"
                      aria-hidden="true"
                    />
                    <div>
                      <p className="text-xs text-muted-foreground">
                        Última actualización
                      </p>
                      <p className="text-sm font-medium">
                        {formatDate(details.updatedAt)}
                      </p>
                    </div>
                  </div>
                </div>
              </>
            ) : null}
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  )
}
