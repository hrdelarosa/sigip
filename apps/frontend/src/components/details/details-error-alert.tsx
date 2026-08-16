import { CircleAlert } from 'lucide-react'
import { Alert, AlertAction, AlertDescription, AlertTitle } from '../ui/alert'
import { Button } from '../ui/button'
import { Spinner } from '../ui/spinner'

interface Props {
  text?: string
  itemType?: string
  onRetry: () => void
  isPending?: boolean
}

export function DetailsErrorAlert({
  text,
  itemType,
  onRetry,
  isPending,
}: Props) {
  const defaultTitle = itemType
    ? `No se pudieron cargar los detalles de ${itemType}`
    : 'No se pudieron cargar los detalles'

  return (
    <Alert variant="destructive">
      <CircleAlert aria-hidden="true" />
      <AlertTitle>{text ?? defaultTitle}</AlertTitle>

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
