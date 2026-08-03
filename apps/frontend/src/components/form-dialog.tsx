import { LoaderCircle } from 'lucide-react'

import { Button } from './ui/button'
import { FieldGroup } from './ui/field'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from './ui/dialog'

interface Props {
  mode?: 'create' | 'edit'
  module: string
  description: string
  children: React.ReactNode
  trigger?: React.ReactElement
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: React.SubmitEventHandler<HTMLFormElement>
  isPending?: boolean
  error?: Error | null
}

export function FormDialog({
  mode = 'create',
  module,
  description,
  children,
  trigger,
  open,
  onOpenChange,
  onSubmit,
  isPending = false,
  error,
}: Props) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {trigger ? <DialogTrigger render={trigger} /> : null}

      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {mode === 'create' ? 'Crear' : 'Editar'} {module}
          </DialogTitle>

          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        <form className="flex flex-col gap-6" onSubmit={onSubmit}>
          <FieldGroup className="gap-4">{children}</FieldGroup>

          {error ? (
            <p className="text-sm text-destructive" role="alert">
              {error.message}
            </p>
          ) : null}

          <DialogFooter>
            <DialogClose
              render={
                <Button variant="outline" type="button" disabled={isPending}>
                  Cancelar
                </Button>
              }
            />

            <Button type="submit" disabled={isPending}>
              {isPending ? (
                <LoaderCircle
                  data-icon="inline-start"
                  className="animate-spin"
                />
              ) : null}
              {mode === 'create' ? 'Crear' : 'Guardar'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
