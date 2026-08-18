export interface DashboardSummaryModel {
  activeEmployees: number;
  absentToday: number;
  absenceRate: number;
  activeIncidentsToday: number;
  monthIncidents: number;
}

export interface DashboardActiveIncidentModel {
  incidentId: string;
  employeeId: string;
  employeeNumber: string;
  employeeName: string;
  organizationalUnit: {
    id: string;
    name: string;
  };
  position: {
    id: string;
    name: string;
  };
  incidentType: {
    id: string;
    code: string;
    name: string;
  };
  occurrence: {
    startDate: Date;
    endDate: Date | null;
  };
  issuedDate: Date | null;
  referenceYear: number | null;
}

export interface DashboardIncidentTypeCountModel {
  incidentTypeId: string;
  code: string;
  name: string;
  count: number;
}
