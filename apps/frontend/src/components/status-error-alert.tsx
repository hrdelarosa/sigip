import { CircleAlert } from 'lucide-react'
import { Alert, AlertDescription, AlertTitle } from './ui/alert'

export function StatusErrorAlert({ errorMessage }: { errorMessage: string }) {
  return (
    <Alert variant="destructive">
      <CircleAlert aria-hidden="true" />
      <AlertTitle>No se pudo cambiar el estado</AlertTitle>
      <AlertDescription>{errorMessage}</AlertDescription>
    </Alert>
  )
}
