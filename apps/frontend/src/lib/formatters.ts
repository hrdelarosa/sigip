export function formatDate(value: string | null): string {
  if (!value) return '-'

  return new Intl.DateTimeFormat('es-MX', {
    dateStyle: 'short',
    timeStyle: 'short',
    hour12: false,
  }).format(new Date(value))
}

export function formatRelative(iso: string | null): string {
  if (!iso) return 'Sin registro'

  const diffMs = Date.now() - new Date(iso).getTime()
  const rtf = new Intl.RelativeTimeFormat('es-MX', { numeric: 'auto' })
  const minutes = Math.round(diffMs / 60000)

  if (Math.abs(minutes) < 60) return rtf.format(-minutes, 'minute')

  const hours = Math.round(minutes / 60)

  if (Math.abs(hours) < 24) return rtf.format(-hours, 'hour')

  const days = Math.round(hours / 24)

  return rtf.format(-days, 'day')
}
