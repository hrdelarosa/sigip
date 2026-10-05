import type { DashboardActiveIncidentResponse } from '@sigip/shared'

export function groupActiveIncidents(items: DashboardActiveIncidentResponse[]) {
  const employees = new Map<string, DashboardActiveIncidentResponse[]>()

  for (const item of items) {
    const incidents = employees.get(item.employeeId) ?? []
    incidents.push(item)
    employees.set(item.employeeId, incidents)
  }

  return [...employees.values()]
}
