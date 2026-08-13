import { ListFilterIcon, SearchIcon } from 'lucide-react'
import { parseISO } from 'date-fns'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { DatePicker } from '@/components/ui/date-picker'
import { Field, FieldGroup, FieldLabel } from '@/components/ui/field'
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from '@/components/ui/input-group'
import { Kbd } from '@/components/ui/kbd'
import {
  Popover,
  PopoverContent,
  PopoverDescription,
  PopoverHeader,
  PopoverTitle,
  PopoverTrigger,
} from '@/components/ui/popover'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import {
  auditActionItems,
  auditEntityItems,
} from '../constants/audit.constants'
import { useAuditFilters } from '../hooks/useAuditFilters'

export function AuditFilters() {
  const {
    filters,
    entityInputRef,
    activeFilterCount,
    updateEntityId,
    updateFilter,
    updateDateFilter,
    clearFilters,
  } = useAuditFilters()

  return (
    <section aria-label="Filtros de auditoría">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <Field className="max-w-md gap-1">
          <FieldLabel htmlFor="audit-entity-search">
            Buscar por entidad
          </FieldLabel>
          <InputGroup>
            <InputGroupInput
              ref={entityInputRef}
              id="audit-entity-search"
              value={filters.entityId ?? ''}
              onChange={(event) => updateEntityId(event.target.value)}
              placeholder="Identificador UUID"
              type="search"
              aria-label="Buscar auditoría por identificador de entidad"
            />
            <InputGroupAddon>
              <SearchIcon
                className="text-muted-foreground"
                aria-hidden="true"
              />
            </InputGroupAddon>
            <InputGroupAddon align="inline-end">
              <Kbd>Ctrl + K</Kbd>
            </InputGroupAddon>
          </InputGroup>
        </Field>

        <Popover>
          <PopoverTrigger
            render={
              <Button variant="secondary">
                <ListFilterIcon data-icon="inline-start" />
                Filtros
                {activeFilterCount > 0 ? (
                  <Badge
                    variant="secondary"
                    className="ml-0.5 rounded-full px-1.5 tabular-nums"
                  >
                    {activeFilterCount}
                  </Badge>
                ) : null}
              </Button>
            }
          />
          <PopoverContent className="w-92 max-w-[calc(100vw-2rem)]" align="end">
            <PopoverHeader className="flex-row items-center justify-between gap-2.5">
              <div className="flex flex-col gap-0.5">
                <PopoverTitle>Filtros</PopoverTitle>
                <PopoverDescription>
                  Refina los eventos por acción, entidad y periodo.
                </PopoverDescription>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={clearFilters}
                disabled={activeFilterCount === 0}
              >
                Limpiar
              </Button>
            </PopoverHeader>

            <Separator />

            <FieldGroup className="gap-3">
              <Field orientation="horizontal">
                <FieldLabel htmlFor="audit-action-filter">Acción</FieldLabel>
                <Select
                  items={auditActionItems}
                  value={filters.action ?? ''}
                  onValueChange={(value) => updateFilter('action', value)}
                >
                  <SelectTrigger
                    id="audit-action-filter"
                    className="w-full max-w-66"
                  >
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectLabel>Acciones</SelectLabel>
                      {auditActionItems.map((action) => (
                        <SelectItem key={action.value} value={action.value}>
                          {action.label}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </Field>

              <Field orientation="horizontal">
                <FieldLabel htmlFor="audit-entity-filters">Entidad</FieldLabel>
                <Select
                  items={auditEntityItems}
                  value={filters.entityType ?? ''}
                  onValueChange={(value) => updateFilter('entityType', value)}
                >
                  <SelectTrigger
                    id="audit-entity-filters"
                    className="w-full max-w-66"
                  >
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectLabel>Entidades</SelectLabel>
                      {auditEntityItems.map((entity) => (
                        <SelectItem key={entity.value} value={entity.value}>
                          {entity.label}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </Field>

              <Separator />

              <Field orientation="horizontal">
                <FieldLabel htmlFor="audit-created-from">Desde</FieldLabel>
                <DatePicker
                  id="audit-created-from"
                  value={filters.createdFrom}
                  onValueChange={(value) =>
                    updateDateFilter('createdFrom', value)
                  }
                  placeholder="Fecha inicial"
                  disabledDates={
                    filters.createdTo
                      ? { after: parseISO(filters.createdTo) }
                      : undefined
                  }
                  buttonClassName="max-w-68"
                />
              </Field>

              <Field orientation="horizontal">
                <FieldLabel htmlFor="audit-created-to">Hasta</FieldLabel>
                <DatePicker
                  id="audit-created-to"
                  value={filters.createdTo}
                  onValueChange={(value) =>
                    updateDateFilter('createdTo', value)
                  }
                  placeholder="Fecha final"
                  disabledDates={
                    filters.createdFrom
                      ? { before: parseISO(filters.createdFrom) }
                      : undefined
                  }
                  buttonClassName="max-w-70"
                />
              </Field>
            </FieldGroup>
          </PopoverContent>
        </Popover>
      </div>
    </section>
  )
}
