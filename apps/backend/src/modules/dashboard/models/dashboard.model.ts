export interface DashboardSummaryModel {
  activeEmployees: number;
  newEmployeesThisMonth: number;
  absentToday: number;
  absenceRate: number;
  activeIncidentsToday: number;
  endingThisWeek: number;
  monthIncidents: number;
  previousMonthIncidents: number;
  monthVariationPercentage: number;
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
  percentage: number;
}

export interface DashboardIncidentTrendModel {
  period: string;
  label: string;
  count: number;
}

export interface DashboardUpcomingReturnModel {
  incidentId: string;
  employee: { id: string; employeeNumber: string; name: string };
  organizationalUnit: { id: string; name: string };
  incidentType: { id: string; code: string; name: string };
  endDate: Date;
  returnDate: Date;
  daysRemaining: number;
}

export interface DashboardRecentIncidentModel {
  incidentId: string;
  employee: { id: string; employeeNumber: string; name: string };
  organizationalUnit: { id: string; name: string };
  incidentType: { id: string; name: string };
  occurrence: { startDate: Date; endDate: Date | null };
  receivedAt: Date;
  status: string;
}
