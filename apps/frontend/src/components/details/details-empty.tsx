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
  media?: React.ReactNode
}

export function DetailsEmpty({ itemType, media }: Props) {
  return (
    <Empty className="border p-6">
      <EmptyHeader>
        <EmptyMedia variant="icon">
          {media || <CircleSlash2 aria-hidden="true" />}
        </EmptyMedia>
        <EmptyTitle>
          <h4>Sin {itemType || 'elementos'} asignados</h4>
        </EmptyTitle>
        <EmptyDescription>
          Este permiso todavía no forma parte de ningún rol.
        </EmptyDescription>
      </EmptyHeader>
    </Empty>
  )
}
