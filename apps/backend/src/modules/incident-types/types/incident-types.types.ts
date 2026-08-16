import type {
  IncidentAppointmentScope,
  IncidentTemporalMode,
} from '@sigip/shared';

export interface IncidentTypeFilters {
  page: number;
  limit: number;
  search?: string;
  isActive?: boolean;
  temporalMode?: IncidentTemporalMode;
  appointmentScope?: IncidentAppointmentScope;
}

export interface CreateIncidentTypeData {
  id: string;
  code: string;
  name: string;
  description: string | null;
  temporalMode: IncidentTemporalMode;
  appointmentScope: IncidentAppointmentScope;
  sortOrder: number;
}

export interface UpdateIncidentTypeData {
  name?: string;
  description?: string | null;
  temporalMode?: IncidentTemporalMode;
  appointmentScope?: IncidentAppointmentScope;
  sortOrder?: number;
  updatedAt: Date;
}
