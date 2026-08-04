import { ShieldCheck } from 'lucide-react'
import { Badge } from './ui/badge'

export function StatusBadge({
  isActive,
  icon = false,
}: {
  isActive: boolean
  icon?: boolean
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
      {isActive ? 'Activo' : 'Inactivo'}
    </Badge>
  )
}
