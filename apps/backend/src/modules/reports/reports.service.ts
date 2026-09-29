import { ForbiddenException, Injectable } from '@nestjs/common';

import type { IncidentsReportResponse } from '@sigip/shared';

import type { GetIncidentsReportDto } from './dto/get-incidents-report.dto';
import type {
  IncidentsReportModel,
  ReportIncidentModel,
} from './models/incidents-report.model';
import { ReportsRepository } from './repositories/reports.repository';
import { resolveReportPeriod } from './reports.dates';
import { toIncidentsReportResponse } from './presenters/incidents-report.presenter';
import type { AuthenticatedUserModel } from '../auth/models/authenticated-user.model';
import { getOfficeScope } from '../../common/authorization/office-scope';
import {
  VACATION_ENTITLEMENT_DAYS,
  addSixCalendarMonths,
  getVacationPeriodDates,
  getVacationPeriodFromCode,
  getVacationPeriodYear,
  institutionalCalendarDate,
} from '../../common/vacation/vacation-control';
import type { GetVacationsReportDto } from './dto/get-vacations-report.dto';
import type { VacationsReportModel } from './models/vacations-report.model';

@Injectable()
export class ReportsService {
  constructor(private readonly repository: ReportsRepository) {}

  async getIncidentsReport(
    filters: GetIncidentsReportDto,
    actor: AuthenticatedUserModel,
  ): Promise<IncidentsReportModel> {
    const period = resolveReportPeriod({
      period: filters.period,
      fortnight: filters.fortnight,
      month: filters.month,
      year: filters.year,
      startDate: filters.startDate,
      endDate: filters.endDate,
    });

    const items = await this.repository.findIncidents({
      startDate: period.startDate,
      endDate: period.endDate,
      incidentTypeId: filters.incidentTypeId,
      organizationalUnitId: filters.organizationalUnitId,
      includeCancelled: filters.includeCancelled ?? false,
      officeId: getOfficeScope(actor).canAccessAllOffices
        ? undefined
        : actor.office.id,
    });

    return {
      period,
      filters: {
        incidentTypeId: filters.incidentTypeId,
        organizationalUnitId: filters.organizationalUnitId,
        includeCancelled: filters.includeCancelled ?? false,
      },
      summary: this.buildSummary(items),
      items,
    };
  }

  toResponse(report: IncidentsReportModel): IncidentsReportResponse {
    return toIncidentsReportResponse(report);
  }

  async getVacationsReport(
    filters: GetVacationsReportDto,
    actor: AuthenticatedUserModel,
  ): Promise<VacationsReportModel> {
    const scope = getOfficeScope(actor);
    if (
      !scope.canAccessAllOffices &&
      filters.officeId &&
      filters.officeId !== scope.officeId
    ) {
      throw new ForbiddenException();
    }
    const officeId = scope.canAccessAllOffices
      ? filters.officeId
      : scope.officeId;
    const employees = await this.repository.findVacationEmployees(officeId);
    const ids = employees.map((employee) => employee.id);
    const [incidents, adjustments] = await Promise.all([
      this.repository.findVacationIncidents(ids, filters.year, officeId),
      this.repository.findVacationAdjustments(ids, filters.year),
    ]);
    const today = institutionalCalendarDate();
    const incidentDays = new Map<string, number>();
    for (const incident of incidents) {
      const period = getVacationPeriodFromCode(incident.code);
      if (
        !period ||
        (incident.referenceYear ??
          getVacationPeriodYear(incident.date, period)) !== filters.year
      ) {
        continue;
      }
      const key = `${incident.employeeId}:${period}`;
      incidentDays.set(key, (incidentDays.get(key) ?? 0) + 1);
    }
    const adjustmentDays = new Map<string, number>();
    for (const adjustment of adjustments) {
      if (adjustment.year !== filters.year) continue;
      const key = `${adjustment.employeeId}:${adjustment.period}`;
      adjustmentDays.set(
        key,
        (adjustmentDays.get(key) ?? 0) + adjustment.daysDelta,
      );
    }
    const periods: Array<'FIRST' | 'SECOND'> =
      filters.period === 'BOTH' ? ['FIRST', 'SECOND'] : [filters.period];
    const items = employees.map((employee) => {
      const eligibilityDate = employee.hireDate
        ? addSixCalendarMonths(employee.hireDate)
        : null;
      return {
        id: employee.id,
        employeeNumber: employee.employeeNumber,
        fullName: employee.fullName,
        office: { id: employee.officeId, name: employee.officeName },
        hireDate: employee.hireDate?.toISOString().slice(0, 10) ?? null,
        periods: periods.map((period) => {
          const key = `${employee.id}:${period}`;
          const periodIncidentDays = incidentDays.get(key) ?? 0;
          const periodAdjustmentDays = adjustmentDays.get(key) ?? 0;
          const { startDate, endDate } = getVacationPeriodDates(
            filters.year,
            period,
          );
          const entitlementDays =
            eligibilityDate && eligibilityDate <= endDate
              ? VACATION_ENTITLEMENT_DAYS
              : 0;
          const status:
            'NOT_ELIGIBLE' | 'NOT_STARTED' | 'AVAILABLE' | 'EXPIRED' =
            !eligibilityDate ||
            eligibilityDate > endDate ||
            today < eligibilityDate
              ? 'NOT_ELIGIBLE'
              : today < startDate
                ? 'NOT_STARTED'
                : today > endDate
                  ? 'EXPIRED'
                  : 'AVAILABLE';
          const consumedDays = periodIncidentDays + periodAdjustmentDays;
          return {
            period,
            entitlementDays,
            incidentDays: periodIncidentDays,
            adjustmentDays: periodAdjustmentDays,
            consumedDays,
            remainingDays: entitlementDays - consumedDays,
            status,
          };
        }),
      };
    });

    return {
      year: filters.year,
      period: filters.period,
      generatedAt: today.toISOString(),
      totalEmployees: items.length,
      totals: {
        firstPeriodRemainingDays: items.reduce((total, item) => {
          const balance = item.periods.find(
            (itemBalance) => itemBalance.period === 'FIRST',
          );
          return (
            total +
            (balance && balance.status !== 'EXPIRED'
              ? balance.remainingDays
              : 0)
          );
        }, 0),
        secondPeriodRemainingDays: items.reduce((total, item) => {
          const balance = item.periods.find(
            (itemBalance) => itemBalance.period === 'SECOND',
          );
          return (
            total +
            (balance && balance.status !== 'EXPIRED'
              ? balance.remainingDays
              : 0)
          );
        }, 0),
      },
      items,
    };
  }

  private buildSummary(
    items: ReportIncidentModel[],
  ): IncidentsReportModel['summary'] {
    const employees = new Set<string>();
    const byTypeMap = new Map<
      string,
      {
        incidentTypeId: string;
        code: string;
        name: string;
        count: number;
      }
    >();

    let registeredIncidents = 0;
    let cancelledIncidents = 0;

    for (const item of items) {
      employees.add(item.employee.id);

      if (item.status === 'REGISTERED') registeredIncidents++;
      else cancelledIncidents++;

      const current = byTypeMap.get(item.incidentType.id);

      if (current) current.count++;
      else {
        byTypeMap.set(item.incidentType.id, {
          incidentTypeId: item.incidentType.id,
          code: item.incidentType.code,
          name: item.incidentType.name,
          count: 1,
        });
      }
    }

    return {
      totalIncidents: items.length,
      totalEmployees: employees.size,
      registeredIncidents,
      cancelledIncidents,
      averageIncidentsPerEmployee:
        employees.size > 0
          ? Math.round((items.length / employees.size) * 10) / 10
          : 0,
      byType: [...byTypeMap.values()]
        .map((item) => ({
          ...item,
          percentage:
            items.length > 0
              ? Math.round((item.count / items.length) * 1000) / 10
              : 0,
        }))
        .sort((a, b) => b.count - a.count),
      byOrganizationalUnit: buildUnitSummary(items),
    };
  }
}

function buildUnitSummary(items: ReportIncidentModel[]) {
  const byUnit = new Map<
    string,
    { organizationalUnitId: string | null; name: string; count: number }
  >();

  for (const item of items) {
    const id = item.organizationalUnit?.id ?? '';
    const current = byUnit.get(id);
    if (current) current.count++;
    else {
      byUnit.set(id, {
        organizationalUnitId: item.organizationalUnit?.id ?? null,
        name: item.organizationalUnit?.name ?? 'No asignado',
        count: 1,
      });
    }
  }

  return [...byUnit.values()]
    .map((item) => ({
      ...item,
      percentage:
        items.length > 0
          ? Math.round((item.count / items.length) * 1000) / 10
          : 0,
    }))
    .sort((a, b) => b.count - a.count);
}
