import { Skeleton } from '../ui/skeleton'
import { TableCell, TableRow } from '../ui/table'

interface SkeletonColumn {
  className?: string
}

interface Props {
  rows: number
  columns: SkeletonColumn[]
  actions?: boolean
}

export function TableSkeleton({ rows, columns, actions = false }: Props) {
  const loadingRows = Array.from({ length: rows }, (_, index) => index)

  return (
    <>
      {loadingRows.map((row) => (
        <TableRow key={row}>
          {columns.map((column, index) => (
            <TableCell key={index}>
              <Skeleton className={`h-4 ${column.className ?? 'w-full'}`} />
            </TableCell>
          ))}

          {actions && (
            <TableCell className="w-16">
              <Skeleton className="size-8" />
            </TableCell>
          )}
        </TableRow>
      ))}
    </>
  )
}
