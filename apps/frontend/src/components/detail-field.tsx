import { cn } from '@/lib/utils'

interface Props extends React.HTMLAttributes<HTMLDivElement> {
  label: string
  children: React.ReactNode
}

export function DetailField({ label, children, className, ...props }: Props) {
  return (
    <div className={cn('min-w-0', className)} {...props}>
      <dt className="text-sm text-muted-foreground">{label}</dt>
      <dd className="wrap-break-word font-medium">{children}</dd>
    </div>
  )
}
