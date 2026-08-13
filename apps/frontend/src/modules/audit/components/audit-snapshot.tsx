import type { LucideIcon } from 'lucide-react'

import { Card, CardContent } from '@/components/ui/card'

interface Props {
  title: string
  description: string
  icon: LucideIcon
  value: unknown
  emphasized?: boolean
}

export function AuditSnapshot({
  title,
  description,
  icon: Icon,
  value,
  emphasized = false,
}: Props) {
  const record = asRecord(value)

  return (
    <Card className={emphasized ? 'border-primary/20' : undefined}>
      <div className="flex items-center gap-3 border-b px-4 py-3.5">
        <span
          className={`flex size-8 shrink-0 items-center justify-center rounded-md ${
            emphasized
              ? 'bg-primary/10 text-primary'
              : 'bg-muted text-muted-foreground'
          }`}
        >
          <Icon className="size-4" aria-hidden="true" />
        </span>
        <div>
          <h3 className="text-sm font-semibold">{title}</h3>
          <p className="text-xs text-muted-foreground">{description}</p>
        </div>
      </div>

      {record ? (
        <dl className="divide-y px-4">
          {Object.entries(record).map(([field, fieldValue]) => (
            <div
              key={field}
              className="grid gap-1 py-3 sm:grid-cols-[minmax(8rem,0.8fr)_1.2fr] sm:gap-4"
            >
              <dt className="text-xs font-medium text-muted-foreground">
                {formatFieldName(field)}
              </dt>
              <dd className="whitespace-pre-wrap wrap-break-words text-sm font-medium sm:text-right">
                {formatAuditValue(fieldValue)}
              </dd>
            </div>
          ))}
        </dl>
      ) : (
        <CardContent className="px-4 py-5">
          <p className="whitespace-pre-wrap wrap-break-words text-sm text-muted-foreground">
            {value === null
              ? 'Sin información registrada'
              : formatAuditValue(value)}
          </p>
        </CardContent>
      )}
    </Card>
  )
}

function asRecord(value: unknown): Record<string, unknown> | null {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null
  return value as Record<string, unknown>
}

function formatAuditValue(value: unknown): string {
  if (value === undefined) return 'Sin registro'
  if (value === null) return 'Nulo'
  if (typeof value === 'boolean') return value ? 'Sí' : 'No'
  if (typeof value === 'object') return JSON.stringify(value, null, 2)
  return String(value)
}

function formatFieldName(value: string): string {
  const words = value
    .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
    .replace(/[_-]+/g, ' ')
    .toLowerCase()

  return words.charAt(0).toUpperCase() + words.slice(1)
}
