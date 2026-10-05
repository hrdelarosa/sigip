import type { UseQueryResult } from '@tanstack/react-query'
import type { DashboardActiveIncidentsResponse } from '@sigip/shared'

import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { groupActiveIncidents } from '../lib/group-active-incidents'
import { ActiveIncidentsSheetList } from './ActiveIncidentsSheetList'

interface Props {
  query: UseQueryResult<DashboardActiveIncidentsResponse>
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ActiveIncidentsSheet({ query, open, onOpenChange }: Props) {
  const employees = groupActiveIncidents(query.data?.items ?? [])

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="gap-0 data-[side=right]:w-full sm:max-w-xl">
        <SheetHeader className="p-6 pr-14">
          <SheetTitle className="text-base font-semibold leading-none">
            Personal ausente hoy
          </SheetTitle>
          <SheetDescription>
            {query.data
              ? `${employees.length} ${employees.length === 1 ? 'persona ausente' : 'personas ausentes'} hoy.`
              : 'Personal con una incidencia registrada vigente el día de hoy.'}
          </SheetDescription>
        </SheetHeader>
        <Separator />
        <ScrollArea className="min-h-0 flex-1">
          <ActiveIncidentsSheetList query={query} employees={employees} />
        </ScrollArea>
      </SheetContent>
    </Sheet>
  )
}
