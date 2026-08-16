import { useQuery } from '@tanstack/react-query'
import { useState } from 'react'

import { routes } from '@/app/router/routes'
import { hasPermission, useAuth } from '@/modules/auth'
import { incidentDetailQueryOptions } from '../queries/incident-query-options'

export function useIncidentDetails(id: string) {
  const query = useQuery(incidentDetailQueryOptions(id))
  const auth = useAuth()
  const [editOpen, setEditOpen] = useState(false)
  const [cancelOpen, setCancelOpen] = useState(false)
  const permissions = auth.data?.permissions

  return {
    backHref: `${routes.incidents.root}${window.location.search}`,
    canCancel: hasPermission(permissions, 'incidents:cancel'),
    canEdit: ['incidents:update', 'employees:read', 'catalogs:read'].every(
      (permission) => hasPermission(permissions, permission),
    ),
    canReadDocuments: hasPermission(permissions, 'documents:read'),
    canCreateDocuments: hasPermission(permissions, 'documents:create'),
    cancelOpen,
    editOpen,
    incident: query.data,
    query,
    setCancelOpen,
    setEditOpen,
  }
}
