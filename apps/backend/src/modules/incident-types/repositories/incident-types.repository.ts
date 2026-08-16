import type { PaginatedResult } from '../../../common/pagination/types/pagination.types';
import type { IncidentTypeModel } from '../models/incident-type.model';
import type {
  CreateIncidentTypeData,
  IncidentTypeFilters,
  UpdateIncidentTypeData,
} from '../types/incident-types.types';
import type { AuditActorContext } from '../../audit/types/audit.types';

export abstract class IncidentTypesRepository {
  abstract findAll(
    filters: IncidentTypeFilters,
  ): Promise<PaginatedResult<IncidentTypeModel>>;
  abstract findById(id: string): Promise<IncidentTypeModel | null>;
  abstract findByCode(code: string): Promise<IncidentTypeModel | null>;
  abstract create(
    data: CreateIncidentTypeData,
    actor: AuditActorContext,
  ): Promise<IncidentTypeModel>;
  abstract update(
    id: string,
    data: UpdateIncidentTypeData,
    actor: AuditActorContext,
  ): Promise<IncidentTypeModel | null>;
  abstract updateStatus(
    id: string,
    isActive: boolean,
    updatedAt: Date,
    actor: AuditActorContext,
  ): Promise<IncidentTypeModel | null>;
}
