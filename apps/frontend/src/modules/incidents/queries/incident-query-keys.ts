import type {
  IncidentListParams,
  IncidentTypeListParams,
} from '../types/incident.types'

export const incidentQueryKeys = {
  all: ['incidents'] as const,
  lists: () => [...incidentQueryKeys.all, 'list'] as const,
  list: (params: IncidentListParams) =>
    [...incidentQueryKeys.lists(), params] as const,
  details: () => [...incidentQueryKeys.all, 'detail'] as const,
  detail: (id: string) => [...incidentQueryKeys.details(), id] as const,
  types: (params: IncidentTypeListParams) =>
    [...incidentQueryKeys.all, 'types', params] as const,
  documents: (id: string) => [...incidentQueryKeys.all, 'documents', id] as const,
}
