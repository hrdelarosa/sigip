import {
  ArrowDownNarrowWide,
  ArrowUpNarrowWide,
  ListFilter,
  SearchIcon,
} from 'lucide-react'
import {
  itemsOrder,
  itemsStatus,
} from '../constants/filters-employees.constants'

import { Kbd } from '@/components/ui/kbd'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import { Field, FieldGroup, FieldLabel } from '@/components/ui/field'
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from '@/components/ui/input-group'
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
import useEmployeeFilters from '../hooks/useEmployeeFilters'

export default function EmployeeFilters() {
  const {
    filters,
    searchInputRef,
    sortField,
    sortDirection,
    activeFilterCount,
    positionItems,
    unitItems,
    positionsDisabled,
    unitsDisabled,
    updateSearch,
    updateFilter,
    updateSortField,
    updateSortDirection,
    clearFilters,
  } = useEmployeeFilters()

  return (
    <section aria-label="Filtro de empleados">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <Field className="max-w-md gap-1">
          <FieldLabel htmlFor="search">Buscar</FieldLabel>
          <InputGroup>
            <InputGroupInput
              ref={searchInputRef}
              id="search"
              maxLength={200}
              value={filters.search}
              onChange={(event) => updateSearch(event.target.value)}
              placeholder="Buscar por número o nombre"
              type="search"
              aria-label="Buscar empleados"
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

        <div>
          <Popover>
            <PopoverTrigger
              render={
                <Button variant="secondary">
                  <ListFilter data-icon="inline-start" />
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

            <PopoverContent
              className="w-92 max-w-[calc(100vw-2rem)]"
              align="end"
            >
              <PopoverHeader className="flex-row items-center justify-between gap-2.5">
                <div className="flex flex-col gap-0.5">
                  <PopoverTitle>Filtros</PopoverTitle>
                  <PopoverDescription>
                    Aplica filtros para refinar la búsqueda de empleados.
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

              <FieldGroup className="gap-2.75">
                <Field orientation="horizontal">
                  <FieldLabel htmlFor="employee-status-filter">
                    Estado
                  </FieldLabel>
                  <Select
                    items={itemsStatus}
                    value={filters.status ?? ''}
                    onValueChange={(value) => updateFilter('status', value)}
                  >
                    <SelectTrigger
                      id="employee-status-filter"
                      className="w-full max-w-66"
                    >
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectLabel>Estados</SelectLabel>
                        {itemsStatus.map((item) => (
                          <SelectItem key={item.value} value={item.value}>
                            {item.label}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </Field>

                <Field orientation="horizontal">
                  <FieldLabel htmlFor="employee-position-filter">
                    Puesto
                  </FieldLabel>
                  <Select
                    items={positionItems}
                    value={filters.positionId ?? ''}
                    onValueChange={(value) => updateFilter('positionId', value)}
                    disabled={positionsDisabled}
                  >
                    <SelectTrigger
                      id="employee-position-filter"
                      className="w-full max-w-66"
                    >
                      <SelectValue placeholder="Todos los puestos" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectLabel>Puestos</SelectLabel>
                        {positionItems.map((position) => (
                          <SelectItem key={position.value} value={position.value}>
                            {position.label}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </Field>

                <Field orientation="horizontal">
                  <FieldLabel htmlFor="employee-unit-filter">Unidad</FieldLabel>
                  <Select
                    items={unitItems}
                    value={filters.organizationalUnitId ?? ''}
                    onValueChange={(value) =>
                      updateFilter('organizationalUnitId', value)
                    }
                    disabled={unitsDisabled}
                  >
                    <SelectTrigger
                      id="employee-unit-filter"
                      className="w-full max-w-66"
                    >
                      <SelectValue placeholder="Todas las unidades" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectLabel>Unidades Organizacionales</SelectLabel>
                        {unitItems.map((unit) => (
                          <SelectItem key={unit.value} value={unit.value}>
                            {unit.label}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </Field>

                <Separator />

                <Field orientation="horizontal">
                  <FieldLabel htmlFor="employee-sort-field">
                    Ordenar por
                  </FieldLabel>
                  <Select
                    items={itemsOrder}
                    value={sortField}
                    onValueChange={updateSortField}
                  >
                    <SelectTrigger
                      id="employee-sort-field"
                      className="w-full max-w-60"
                    >
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectLabel>Ordenar por</SelectLabel>
                        {itemsOrder.map((item) => (
                          <SelectItem key={item.value} value={item.value}>
                            {item.label}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </Field>

                <Field orientation="horizontal">
                  <FieldLabel>Dirección</FieldLabel>
                  <ToggleGroup
                    variant="outline"
                    size="sm"
                    spacing={0}
                    value={[sortDirection]}
                    onValueChange={updateSortDirection}
                    aria-label="Dirección del orden"
                  >
                    <ToggleGroupItem value="asc" aria-label="Ascendente">
                      <ArrowUpNarrowWide data-icon="inline-start" />
                      Asc
                    </ToggleGroupItem>
                    <ToggleGroupItem value="desc" aria-label="Descendente">
                      <ArrowDownNarrowWide data-icon="inline-start" />
                      Desc
                    </ToggleGroupItem>
                  </ToggleGroup>
                </Field>
              </FieldGroup>
            </PopoverContent>
          </Popover>
        </div>
      </div>
    </section>
  )
}
