export interface IncidentOccurrenceModel {
  id: string;
  incidentId: string;
  startDate: Date;
  endDate: Date | null;
  createdAt: Date;
}
