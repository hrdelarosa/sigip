import type {
  IncidentAppointmentScope,
  IncidentTemporalMode,
} from '@sigip/shared';

export interface IncidentTypeModel {
  id: string;
  code: string;
  name: string;
  description: string | null;
  temporalMode: IncidentTemporalMode;
  appointmentScope: IncidentAppointmentScope;
  isActive: boolean;
  sortOrder: number;
  createdAt: Date;
  updatedAt: Date;
}
