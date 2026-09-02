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
import { useOffices } from '@/modules/administration/offices/hooks/useOffices'

const columns: DataTableColumn<Employee>[] = [
  {
    key: 'employeeNumber',
    header: 'No. empleado',
    headerClassName: 'w-[110px]',
    cellClassName: 'font-medium whitespace-nowrap',
    skeletonClassName: 'w-28',
    render: (employee) => employee.employeeNumber,
  },
  {
    key: 'fullName',
    header: 'Nombre completo',
    headerClassName: 'w-[300px]',
    cellClassName: 'whitespace-nowrap',
    skeletonClassName: 'w-40',
    render: (employee) => employee.fullName,
  },
  {
    key: 'hireDate',
    header: 'Contratación',
    headerClassName: 'w-[170px]',
    cellClassName: 'whitespace-nowrap',
    skeletonClassName: 'w-32',
    render: (employee) =>
      employee.hireDate
        ? format(parseISO(employee.hireDate), 'PPP', { locale: es })
        : 'No registrada',
  },
  {
    key: 'office',
    header: 'Oficina',
    headerClassName: 'w-auto',
    cellClassName: 'min-w-0',
    skeletonClassName: 'w-32',
    render: () => null,
  },
  {
    key: 'status',
    header: 'Estado',
    headerClassName: 'w-[90px]',
    cellClassName: 'whitespace-nowrap',
    skeletonClassName: 'w-16',
    render: (employee) => (
      <StatusBadge isActive={employee.status === 'ACTIVE'} />
    ),
  },
  {
    key: 'updatedAt',
    header: 'Actualizado',
    headerClassName: 'w-[135px]',
    cellClassName: 'whitespace-nowrap',
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
  const officesQuery = useOffices()
  const offices = officesQuery.data ?? []
  const officeById = new Map(offices.map((office) => [office.id, office]))
  const tableColumns = columns.map((column) =>
    column.key === 'office'
      ? {
          ...column,
          render: (employee: Employee) => {
            const officeName = employee.officeId
              ? (officeById.get(employee.officeId)?.name ??
                'Oficina no disponible')
              : 'Sin oficina asignada'

            return (
              <div className="min-w-0 truncate" title={officeName}>
                {officeName}
              </div>
            )
          },
        }
      : column,
  )

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
        columns={tableColumns}
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
        tableFixed
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
