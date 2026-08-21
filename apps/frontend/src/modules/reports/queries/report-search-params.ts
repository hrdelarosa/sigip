import type { ReportFortnightOption, ReportPeriodType } from '@sigip/shared'
import {
  parseAsBoolean,
  parseAsInteger,
  parseAsString,
  parseAsStringLiteral,
} from 'nuqs'

const periodTypes: ReportPeriodType[] = ['FORTNIGHT', 'MONTH', 'YEAR', 'CUSTOM']
const fortnightOptions: ReportFortnightOption[] = ['FIRST', 'SECOND']
const now = new Date()

export const reportSearchParams = {
  period: parseAsStringLiteral(periodTypes).withDefault('MONTH'),
  fortnight: parseAsStringLiteral(fortnightOptions).withDefault('FIRST'),
  month: parseAsInteger.withDefault(now.getMonth() + 1),
  year: parseAsInteger.withDefault(now.getFullYear()),
  startDate: parseAsString,
  endDate: parseAsString,
  incidentTypeId: parseAsString,
  organizationalUnitId: parseAsString,
  includeCancelled: parseAsBoolean.withDefault(false),
}
