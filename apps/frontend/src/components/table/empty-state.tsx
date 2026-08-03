import { TableCell, TableRow } from '../ui/table'

interface Props {
  colSpan: number
  message: string
}

export function EmptyState({ colSpan, message }: Props) {
  return (
    <TableRow>
      <TableCell
        colSpan={colSpan}
        className="h-32 text-center text-muted-foreground"
      >
        {message}
      </TableCell>
    </TableRow>
  )
}
