import { queryOptions } from '@tanstack/react-query'
import {
  getIncidentById,
  getIncidentDocuments,
  getIncidents,
  getIncidentTypes,
} from '../api/incidents.api'
import { incidentQueryKeys } from './incident-query-keys'
import type {
  IncidentListParams,
  IncidentTypeListParams,
} from '../types/incident.types'

export function incidentQueryOptions(params: IncidentListParams) {
  return queryOptions({
    queryKey: incidentQueryKeys.list(params),
    queryFn: ({ signal }) => getIncidents(params, signal),
    staleTime: 30_000,
  })
}

export function incidentDetailQueryOptions(id: string) {
  return queryOptions({
    queryKey: incidentQueryKeys.detail(id),
    queryFn: ({ signal }) =>
      getIncidentById({
        id,
        signal,
      }),
    staleTime: 30_000,
  })
}

export function incidentTypesQueryOptions(params: IncidentTypeListParams) {
  return queryOptions({
    queryKey: incidentQueryKeys.types(params),
    queryFn: ({ signal }) => getIncidentTypes(params, signal),
    staleTime: 5 * 60_000,
  })
}

export function incidentDocumentsQueryOptions(id: string) {
  return queryOptions({
    queryKey: incidentQueryKeys.documents(id),
    queryFn: ({ signal }) => getIncidentDocuments(id, signal),
    staleTime: 30_000,
  })
}
