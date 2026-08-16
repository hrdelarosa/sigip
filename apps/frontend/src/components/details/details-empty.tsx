import { CircleSlash2 } from 'lucide-react'
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '../ui/empty'

interface Props {
  itemType?: string
  title?: string
  description?: string
  media?: React.ReactNode
}

export function DetailsEmpty({ itemType, title, description, media }: Props) {
  const resolved =
    title ??
    (itemType ? `Sin ${itemType} asignados` : 'Sin elementos asignados')

  return (
    <Empty className="border p-6">
      <EmptyHeader>
        <EmptyMedia variant="icon">
          {media || <CircleSlash2 aria-hidden="true" />}
        </EmptyMedia>
        <EmptyTitle>
          <h4>{resolved}</h4>
        </EmptyTitle>
        <EmptyDescription>
          {description || 'No hay elementos disponibles para mostrar.'}
        </EmptyDescription>
      </EmptyHeader>
    </Empty>
  )
}
