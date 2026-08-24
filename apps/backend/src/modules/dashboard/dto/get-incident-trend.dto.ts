import { IsIn } from 'class-validator';

export const DASHBOARD_TREND_PERIODS = ['3m', '6m', 'ytd', '12m'] as const;
export type DashboardTrendPeriod = (typeof DASHBOARD_TREND_PERIODS)[number];

export class GetIncidentTrendDto {
  @IsIn(DASHBOARD_TREND_PERIODS)
  period: DashboardTrendPeriod = '6m';
}
