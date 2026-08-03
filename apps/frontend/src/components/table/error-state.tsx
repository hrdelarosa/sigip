import { Button } from '../ui/button'
import { TableCell, TableRow } from '../ui/table'

interface Props {
  colSpan: number
  message: string
  onRetry: () => void
}

export function Errorstate({ colSpan, message, onRetry }: Props) {
  return (
    <TableRow>
      <TableCell colSpan={colSpan} className="h-32 text-center">
        <div className="flex flex-col items-center gap-3">
          <p className="text-muted-foreground">{message}</p>
          <Button variant="outline" size="sm" onClick={onRetry}>
            Reintentar
          </Button>
        </div>
      </TableCell>
    </TableRow>
  )
}
