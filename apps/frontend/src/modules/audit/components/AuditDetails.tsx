import {
  CalendarClockIcon,
  CircleArrowRightIcon,
  FingerprintIcon,
  GlobeIcon,
  HistoryIcon,
  MonitorIcon,
  UserRoundIcon,
} from 'lucide-react'
import { formatDate, formatRelative } from '@/lib/formatters'
import { DetailsErrorAlert } from '@/components/details/details-error-alert'
import { Badge } from '@/components/ui/badge'
import {
  Card,
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
import { useAuditLog } from '../hooks/useAudit'
import {
  auditActionLabels,
  auditEntityLabels,
} from '../constants/audit.constants'
import { AuditContextRow } from './audit-context-row'
import { AuditDetailsSkeleton } from './audit-details-skeleton'
import { AuditSnapshot } from './audit-snapshot'

interface Props {
  auditId: string
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function AuditDetails({ auditId, open, onOpenChange }: Props) {
  const query = useAuditLog(open ? auditId : null)
  const audit = query.data

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="gap-0 sm:max-w-xl">
        <SheetHeader className="p-6 pr-14">
          <SheetTitle className="text-base font-semibold leading-none">
            Registro de auditoría
          </SheetTitle>
          <SheetDescription>
            Evidencia inmutable de la operación seleccionada.
          </SheetDescription>
        </SheetHeader>
        <Separator />
        <ScrollArea className="min-h-0 flex-1">
          <div
            className="flex flex-col gap-4 p-4 sm:p-6"
            aria-busy={query.isPending}
          >
            {query.isPending ? <AuditDetailsSkeleton /> : null}
            {query.isError ? (
              <DetailsErrorAlert
                itemType="registro de auditoría"
                onRetry={() => query.refetch()}
                isPending={query.isPending}
              />
            ) : null}
            {audit ? (
              <>
                <Card className="overflow-hidden">
                  <CardHeader>
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <CardDescription className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                          Operación registrada
                        </CardDescription>
                        <CardTitle className="mt-1 text-lg font-semibold">
                          {auditActionLabels[audit.action] ?? audit.action}
                        </CardTitle>
                      </div>

                      <Badge variant="outline" className="bg-background">
                        {auditEntityLabels[audit.entityType] ??
                          audit.entityType}
                      </Badge>
                    </div>

                    <div className="mt-4 flex items-center gap-3">
                      <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-background text-muted-foreground ring-1 ring-border">
                        <UserRoundIcon className="size-4" aria-hidden="true" />
                      </span>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium">
                          {audit.actor?.fullName ?? 'Sistema / anónimo'}
                        </p>
                        <p className="truncate text-xs text-muted-foreground">
                          {audit.actor
                            ? `@${audit.actor.username}`
                            : 'Sin usuario autenticado'}
                        </p>
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className="p-0">
                    <Separator />

                    <dl className="divide-y">
                      <AuditContextRow
                        icon={CalendarClockIcon}
                        label="Fecha del evento"
                        value={formatDate(audit.createdAt)}
                        hint={formatRelative(audit.createdAt)}
                      />
                      <AuditContextRow
                        icon={FingerprintIcon}
                        label="Entidad afectada"
                        value={audit.entityId ?? 'No aplica'}
                        code={Boolean(audit.entityId)}
                      />
                      <AuditContextRow
                        icon={FingerprintIcon}
                        label="Sesión"
                        value={audit.sessionId ?? 'No aplica'}
                        code={Boolean(audit.sessionId)}
                      />
                      <AuditContextRow
                        icon={GlobeIcon}
                        label="Dirección IP"
                        value={audit.ipAddress ?? 'No disponible'}
                      />
                      <AuditContextRow
                        icon={MonitorIcon}
                        label="Dispositivo y navegador"
                        value={audit.userAgent ?? 'No disponible'}
                        orientation="vertical"
                      />
                    </dl>
                  </CardContent>
                </Card>

                <section aria-labelledby="audit-values-heading">
                  <div className="mb-3">
                    <h2
                      id="audit-values-heading"
                      className="text-sm font-semibold"
                    >
                      Datos de la operación
                    </h2>
                    <p className="text-xs text-muted-foreground">
                      Valores conservados antes y después del cambio.
                    </p>
                  </div>
                  <div className="grid gap-4">
                    <AuditSnapshot
                      title="Valores anteriores"
                      description="Estado previo"
                      icon={HistoryIcon}
                      value={audit.oldValues}
                    />
                    <AuditSnapshot
                      title="Valores nuevos"
                      description="Estado resultante"
                      icon={CircleArrowRightIcon}
                      value={audit.newValues}
                      emphasized
                    />
                  </div>
                </section>
              </>
            ) : null}
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  )
}
