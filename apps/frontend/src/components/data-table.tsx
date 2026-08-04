import type { DataTableColumn } from '@/modules/administration/permissions/types/table.types'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { TableSkeleton } from './skeletons/table-skeleton'
import { EmptyState } from './table/empty-state'
import { Errorstate } from './table/error-state'

interface DataTableProps<T> {
  columns: DataTableColumn<T>[]
  data: T[] | undefined
  isPending: boolean
  isError: boolean
  isSuccess: boolean
  onRetry: () => void
  getRowKey: (row: T) => string | number
  emptyMessage?: string
  errorMessage?: string
  skeletonRows?: number
  renderActions?: (row: T) => React.ReactNode
}

export function DataTable<T>({
  columns,
  data,
  isPending,
  isError,
  isSuccess,
  onRetry,
  getRowKey,
  emptyMessage = 'No hay registros.',
  errorMessage = 'No fue posible cargar la información.',
  skeletonRows = 9,
  renderActions,
}: DataTableProps<T>) {
  const colSpan = columns.length + (renderActions ? 1 : 0)

  return (
    <div className="overflow-hidden rounded-md border">
      <Table aria-busy={isPending}>
        <TableHeader className="bg-muted">
          <TableRow>
            {columns.map((column) => (
              <TableHead key={column.key} className={column.headerClassName}>
                {column.header}
              </TableHead>
            ))}
            {renderActions ? (
              <TableHead className="w-16">
                <span className="sr-only">Acciones</span>
              </TableHead>
            ) : null}
          </TableRow>
        </TableHeader>

        <TableBody>
          {isPending ? (
            <TableSkeleton
              rows={skeletonRows}
              columns={columns.map((column) => ({
                className: column.skeletonClassName,
              }))}
              actions={Boolean(renderActions)}
            />
          ) : null}

          {isError ? (
            <Errorstate
              colSpan={colSpan}
              message={errorMessage}
              onRetry={onRetry}
            />
          ) : null}

          {isSuccess && data && data.length === 0 ? (
            <EmptyState colSpan={colSpan} message={emptyMessage} />
          ) : null}

          {isSuccess && data
            ? data.map((row) => (
                <TableRow key={getRowKey(row)}>
                  {columns.map((column) => (
                    <TableCell
                      key={column.key}
                      className={column.cellClassName}
                    >
                      {column.render(row)}
                    </TableCell>
                  ))}
                  {renderActions ? (
                    <TableCell>{renderActions(row)}</TableCell>
                  ) : null}
                </TableRow>
              ))
            : null}
        </TableBody>
      </Table>
    </div>
  )
}
