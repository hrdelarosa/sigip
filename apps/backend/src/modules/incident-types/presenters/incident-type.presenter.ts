import type { IncidentTypeResponse } from '@sigip/shared';
import type { IncidentTypeModel } from '../models/incident-type.model';

export function toIncidentTypeResponse(
  model: IncidentTypeModel,
): IncidentTypeResponse {
  return {
    id: model.id,
    code: model.code,
    name: model.name,
    description: model.description,
    temporalMode: model.temporalMode,
    appointmentScope: model.appointmentScope,
    isActive: model.isActive,
    sortOrder: model.sortOrder,
    createdAt: model.createdAt.toISOString(),
    updatedAt: model.updatedAt.toISOString(),
  };
}
