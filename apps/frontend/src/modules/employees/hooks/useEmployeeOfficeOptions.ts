import { useQuery } from '@tanstack/react-query'
import { apiRequest } from '@/lib/api/api-client'
import { useAuth, hasPermission } from '@/modules/auth/hooks/useAuth'

type EmployeeOfficeOption = { id: string; name: string; code: string }

export function useEmployeeOfficeOptions() {
  const auth = useAuth()
  const permissions = auth.data?.permissions ?? []
  const canChooseAll = hasPermission(permissions, 'offices:access-all')
  return useQuery({
    queryKey: ['employees', 'office-options', canChooseAll ? 'all' : auth.data?.office.id],
    queryFn: () => apiRequest<EmployeeOfficeOption[]>('/employees/office-options'),
    enabled: !!auth.data && (hasPermission(permissions, 'employees:create') || hasPermission(permissions, 'employees:update')),
  })
}
