import type { LucideIcon } from 'lucide-react'

interface Props {
  icon: LucideIcon
  label: string
  value: string
  hint?: string
  code?: boolean
  orientation?: 'vertical' | 'horizontal'
}

export function AuditContextRow({
  icon: Icon,
  label,
  value,
  hint,
  code = false,
  orientation = 'horizontal',
}: Props) {
  return (
    <div
      className={
        orientation === 'vertical'
          ? 'flex flex-col gap-1.5 px-4 py-3.5 sm:px-5'
          : 'flex items-start gap-1.5 px-4 py-3.5 sm:px-5'
      }
    >
      <div
        className={`flex ${orientation === 'vertical' ? 'items-center ' : 'items-start'} gap-1.5`}
      >
        <Icon
          className="mt-0.5 size-4 shrink-0 text-muted-foreground"
          aria-hidden="true"
        />
        <dt
          className={`${orientation === 'vertical' ? 'w-full' : 'w-32'} shrink-0 text-sm text-muted-foreground`}
        >
          {label}
        </dt>
      </div>

      <dd className="min-w-0 flex-1 text-right text-sm font-medium">
        {code ? (
          <code className="break-all font-mono text-xs">{value}</code>
        ) : (
          <span className="wrap-break-word">{value}</span>
        )}
        {hint ? (
          <span className="block text-xs font-normal text-muted-foreground">
            {hint}
          </span>
        ) : null}
      </dd>
    </div>
  )
}
