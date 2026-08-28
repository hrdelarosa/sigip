import type { PaginationMeta } from '@sigip/shared'
import { useId } from 'react'

import { Field, FieldLabel } from './ui/field'
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
} from './ui/pagination'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select'

interface Props {
  text: string
  meta: PaginationMeta | undefined
  limit: number
  pageSizes?: readonly number[]
  onValueChange: (value: string | null) => void
  onPreviousClick: () => void
  onNextClick: () => void
}

export function PaginationPage({
  text,
  meta,
  limit,
  pageSizes = [10, 20, 25, 30],
  onValueChange,
  onNextClick,
  onPreviousClick,
}: Props) {
  const selectId = useId()
  const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' })
  const handlePreviousClick = () => {
    onPreviousClick()
    scrollToTop()
  }
  const handleNextClick = () => {
    onNextClick()
    scrollToTop()
  }

  if (!meta) return null
  if (meta.total === 0) return null

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between sm:gap-6">
      <p className="text-muted-foreground text-sm" aria-live="polite">
        Página {meta.page} de {meta.totalPages} · {meta.total} {text}
      </p>

      <div className="flex flex-wrap items-center justify-between gap-3 sm:justify-start">
        <Field orientation="horizontal" className="w-fit">
          <FieldLabel
            htmlFor={selectId}
            className="hidden text-sm text-muted-foreground sm:block"
          >
            {text.charAt(0).toUpperCase() + text.slice(1)} por página
          </FieldLabel>
          <Select value={String(limit)} onValueChange={onValueChange}>
            <SelectTrigger
              className="w-16"
              aria-label={`${text.charAt(0).toUpperCase() + text.slice(1)} por página`}
              id={selectId}
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent align="start">
              <SelectGroup>
                {pageSizes.map((limit) => (
                  <SelectItem key={limit} value={String(limit)}>
                    {limit}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </Field>

        {meta.totalPages > 1 ? (
          <Pagination className="mx-0 w-auto">
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  onClick={
                    meta.hasPreviousPage ? handlePreviousClick : undefined
                  }
                  text="Anterior"
                  aria-disabled={!meta.hasPreviousPage}
                  tabIndex={meta.hasPreviousPage ? undefined : -1}
                  className={
                    !meta.hasPreviousPage
                      ? 'pointer-events-none opacity-50'
                      : undefined
                  }
                />
              </PaginationItem>
              <PaginationItem>
                <PaginationNext
                  onClick={meta.hasNextPage ? handleNextClick : undefined}
                  text="Siguiente"
                  aria-disabled={!meta.hasNextPage}
                  tabIndex={meta.hasNextPage ? undefined : -1}
                  className={
                    !meta.hasNextPage
                      ? 'pointer-events-none opacity-50'
                      : undefined
                  }
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        ) : null}
      </div>
    </div>
  )
}
