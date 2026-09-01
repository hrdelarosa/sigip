import type { Office } from '../types/office.types'

import { DataTable, type DataTableColumn } from '@/components/data-table'
import PageHeader from '@/components/page-header'
import { StatusBadge } from '@/components/status-badge'
import OfficeActions from '../components/OfficeActions'
import { useOffices } from '../hooks/useOffices'

const columns: DataTableColumn<Office>[] = [
  {
    key: 'code',
    header: 'Código',
    cellClassName: 'font-medium',
    render: (office) => office.code,
  },
  {
    key: 'name',
    header: 'Oficina',
    render: (office) => office.name,
  },
  {
    key: 'municipality',
    header: 'Municipio',
    render: (office) => office.municipality || 'Sin municipio',
  },
  {
    key: 'isActive',
    header: 'Estado',
    render: (office) => <StatusBadge isActive={office.isActive} />,
  },
]

export function OfficesPage() {
  const query = useOffices()

  return (
    <>
      <PageHeader
        title="Oficinas"
        description="Consulta las oficinas que forman parte de la organización."
      />
      <DataTable
        columns={columns}
        data={query.data ?? []}
        isPending={query.isPending}
        isError={query.isError}
        isSuccess={query.isSuccess}
        onRetry={() => query.refetch()}
        getRowKey={(office) => office.id}
        emptyMessage="No hay oficinas registradas."
        errorMessage="No fue posible cargar las oficinas."
        skeletonRows={4}
        renderActions={(office) => <OfficeActions office={office} />}
      />
    </>
  )
}
