import type { Employee } from '../types/employee.types'
import { formatDate } from '@/lib/formatters'
import { format, parseISO } from 'date-fns'
import { es } from 'date-fns/locale'
import { DataTable, type DataTableColumn } from '@/components/data-table'
import { StatusBadge } from '@/components/status-badge'
import PageHeader from '@/components/page-header'
import EmployeeCreate from '../components/EmployeeCreate'
import EmployeeActions from '../components/EmployeeActions'
import EmployeeFilters from '../components/EmployeeFilters'
import { PaginationPage } from '@/components/pagination-page'
import { useEmployeesPage } from '../hooks/useEmployeesPage'
import { useAuth } from '@/modules/auth'
import { getEmployeePermissions } from '../lib/employee-permissions'

const columns: DataTableColumn<Employee>[] = [
  {
    key: 'employeeNumber',
    header: 'No. empleado',
    cellClassName: 'font-medium',
    skeletonClassName: 'w-28',
    render: (employee) => employee.employeeNumber,
  },
  {
    key: 'fullName',
    header: 'Nombre completo',
    skeletonClassName: 'w-40',
    render: (employee) => employee.fullName,
  },
  {
    key: 'hireDate',
    header: 'Contratación',
    skeletonClassName: 'w-32',
    render: (employee) =>
      employee.hireDate
        ? format(parseISO(employee.hireDate), 'PPP', { locale: es })
        : 'No registrada',
  },
  {
    key: 'status',
    header: 'Estado',
    skeletonClassName: 'w-16',
    render: (employee) => (
      <StatusBadge isActive={employee.status === 'ACTIVE'} />
    ),
  },
  {
    key: 'updatedAt',
    header: 'Actualizado',
    skeletonClassName: 'w-28',
    render: (employee) => formatDate(employee.updatedAt),
  },
]

export function EmployeesPage() {
  const auth = useAuth()
  const { canCreate } = getEmployeePermissions(
    auth.data?.permissions,
    undefined,
  )
  const {
    employeesQuery,
    meta,
    limit,
    pageSizes,
    hasFilters,
    setPageSize,
    goToPreviousPage,
    goToNextPage,
  } = useEmployeesPage()

  return (
    <>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <PageHeader
          title="Empleados"
          description="Gestiona la información de los empleados, sus puestos y su estado en la organización."
        />
        {canCreate ? <EmployeeCreate /> : null}
      </div>

      <EmployeeFilters />

      <DataTable
        columns={columns}
        data={employeesQuery.data?.items}
        isPending={employeesQuery.isPending}
        isError={employeesQuery.isError}
        isSuccess={employeesQuery.isSuccess}
        onRetry={() => employeesQuery.refetch()}
        getRowKey={(employee) => employee.id}
        emptyMessage={
          hasFilters
            ? 'No hay empleados que coincidan con los filtros.'
            : 'No hay empleados registrados.'
        }
        errorMessage="No fue posible cargar los empleados."
        skeletonRows={Math.min(limit, 10)}
        renderActions={(employee) => <EmployeeActions employee={employee} />}
      />

      <PaginationPage
        text="empleados"
        meta={meta}
        limit={limit}
        pageSizes={pageSizes}
        onValueChange={setPageSize}
        onPreviousClick={goToPreviousPage}
        onNextClick={goToNextPage}
      />
    </>
  )
}
