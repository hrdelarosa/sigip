import { CircleAlert } from 'lucide-react'
import { Alert, AlertAction, AlertDescription, AlertTitle } from '../ui/alert'
import { Button } from '../ui/button'
import { Spinner } from '../ui/spinner'

interface Props {
  itemType?: string
  onRetry: () => void
  isPending?: boolean
}

export function DetailsErrorAlert({ itemType, onRetry, isPending }: Props) {
  return (
    <Alert variant="destructive">
      <CircleAlert aria-hidden="true" />
      <AlertTitle>
        No se pudieron cargar los detalles del {itemType || 'elemento'}
      </AlertTitle>
      <AlertDescription>
        Comprueba la conexión e inténtalo nuevamente.
      </AlertDescription>
      <AlertAction>
        <Button variant="outline" size="xs" onClick={() => onRetry()}>
          {isPending ? <Spinner /> : 'Reintentar'}
        </Button>
      </AlertAction>
    </Alert>
  )
}
