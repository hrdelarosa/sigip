import { parseISO } from 'date-fns'
import { ListFilterIcon, SearchIcon } from 'lucide-react'

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
import { useIncidentFilters } from '../hooks/useIncidentFilters'

const statusItems = [
  { value: '', label: 'Todos los estados' },
  { value: 'REGISTERED', label: 'Registrada' },
  { value: 'CANCELLED', label: 'Cancelada' },
]

export function IncidentFilters() {
  const {
    filters,
    searchInputRef,
    activeFilterCount,
    typeItems,
    unitItems,
    typesDisabled,
    unitsDisabled,
    updateSearch,
    updateFilter,
    updateDateFilter,
    clearFilters,
  } = useIncidentFilters()

  return (
    <section aria-label="Filtros de incidencias">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <Field className="max-w-md gap-1">
          <FieldLabel htmlFor="incident-search">Buscar incidencias</FieldLabel>
          <InputGroup>
            <InputGroupInput
              ref={searchInputRef}
              id="incident-search"
              value={filters.search}
              onChange={(event) => updateSearch(event.target.value)}
              placeholder="Empleado, número o tipo"
              type="search"
            />
            <InputGroupAddon>
              <SearchIcon aria-hidden="true" />
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
                  <Badge variant="secondary" className="rounded-full px-1.5">
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
                  Refina por estado, tipo, adscripción y periodo.
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
              <FilterSelect
                id="incident-status-filter"
                label="Estado"
                value={filters.status ?? ''}
                items={statusItems}
                onValueChange={(value) => updateFilter('status', value)}
              />
              <FilterSelect
                id="incident-type-filter"
                label="Tipo"
                value={filters.incidentTypeId ?? ''}
                items={typeItems}
                disabled={typesDisabled}
                onValueChange={(value) =>
                  updateFilter('incidentTypeId', value)
                }
              />
              <FilterSelect
                id="incident-unit-filter"
                label="Adscripción"
                value={filters.organizationalUnitId ?? ''}
                items={unitItems}
                disabled={unitsDisabled}
                onValueChange={(value) =>
                  updateFilter('organizationalUnitId', value)
                }
              />
              <Separator />
              <Field orientation="horizontal">
                <FieldLabel htmlFor="incident-from">Desde</FieldLabel>
                <DatePicker
                  id="incident-from"
                  value={filters.from}
                  onValueChange={(value) => updateDateFilter('from', value)}
                  placeholder="Fecha inicial"
                  disabledDates={
                    filters.to
                      ? { after: parseISO(filters.to) }
                      : undefined
                  }
                  buttonClassName="max-w-68"
                />
              </Field>
              <Field orientation="horizontal">
                <FieldLabel htmlFor="incident-to">Hasta</FieldLabel>
                <DatePicker
                  id="incident-to"
                  value={filters.to}
                  onValueChange={(value) => updateDateFilter('to', value)}
                  placeholder="Fecha final"
                  disabledDates={
                    filters.from
                      ? { before: parseISO(filters.from) }
                      : undefined
                  }
                  buttonClassName="max-w-68"
                />
              </Field>
            </FieldGroup>
          </PopoverContent>
        </Popover>
      </div>
    </section>
  )
}

function FilterSelect({
  id,
  label,
  value,
  items,
  disabled,
  onValueChange,
}: {
  id: string
  label: string
  value: string
  items: { value: string; label: string }[]
  disabled?: boolean
  onValueChange: (value: string | null) => void
}) {
  return (
    <Field orientation="horizontal">
      <FieldLabel htmlFor={id}>{label}</FieldLabel>
      <Select
        items={items}
        value={value}
        onValueChange={onValueChange}
        disabled={disabled}
      >
        <SelectTrigger id={id} className="w-full max-w-66">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            <SelectLabel>{label}</SelectLabel>
            {items.map((item) => (
              <SelectItem key={item.value || 'all'} value={item.value}>
                {item.label}
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>
    </Field>
  )
}
