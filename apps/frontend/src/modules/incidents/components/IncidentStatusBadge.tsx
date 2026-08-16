import type { IncidentStatus } from '@sigip/shared'
import { CircleCheckIcon, CircleXIcon } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { INCIDENT_STATUS_LABELS } from '../constants/incident.constants'

export function IncidentStatusBadge({ status }: { status: IncidentStatus }) {
  return (
    <Badge variant={status === 'REGISTERED' ? 'default' : 'destructive'}>
      {status === 'REGISTERED' ? <CircleCheckIcon /> : <CircleXIcon />}
      {INCIDENT_STATUS_LABELS[status]}
    </Badge>
  )
}
