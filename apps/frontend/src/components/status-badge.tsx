import { ShieldCheck } from 'lucide-react'
import { Badge } from './ui/badge'

export function StatusBadge({
  isActive,
  icon = false,
  dot = false,
}: {
  isActive: boolean
  icon?: boolean
  dot?: boolean
}) {
  return (
    <Badge
      className={`${
        isActive
          ? 'bg-green-50 text-green-700 dark:bg-green-950 dark:text-green-300'
          : 'bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-300'
      }`}
    >
      {icon && <ShieldCheck data-icon="inline-start" aria-hidden="true" />}
      {dot && icon === false && (
        <span className="size-1.5 rounded-full bg-current" />
      )}
      {isActive ? 'Activo' : 'Inactivo'}
    </Badge>
  )
}
