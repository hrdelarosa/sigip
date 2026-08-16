import type { PaginatedResult } from '../../../common/pagination/types/pagination.types';
import type { IncidentDetailsModel } from '../models/incident.model';
import type {
  CancelIncidentData,
  CreateIncidentData,
  IncidentCreationContext,
  IncidentFilters,
  UpdateIncidentData,
} from '../types/incidents.types';

export abstract class IncidentsRepository {
  abstract findAll(
    filters: IncidentFilters,
  ): Promise<PaginatedResult<IncidentDetailsModel>>;
  abstract findById(id: string): Promise<IncidentDetailsModel | null>;
  abstract findCreationContext(
    employeeId: string,
    assignmentId: string,
    incidentTypeId: string,
  ): Promise<IncidentCreationContext>;
  abstract create(data: CreateIncidentData): Promise<IncidentDetailsModel>;
  abstract update(
    id: string,
    data: UpdateIncidentData,
  ): Promise<IncidentDetailsModel | null>;
  abstract cancel(
    id: string,
    data: CancelIncidentData,
  ): Promise<IncidentDetailsModel | null>;
}
