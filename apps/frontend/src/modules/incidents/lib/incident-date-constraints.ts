import type { ComponentProps } from 'react'
import { parseISO } from 'date-fns'

import type { DatePicker } from '@/components/ui/date-picker'

export type DatePickerDisabledDates = ComponentProps<
  typeof DatePicker
>['disabledDates']

export function buildAssignmentDateConstraints(
  effectiveFrom?: string,
  effectiveTo?: string | null,
): DatePickerDisabledDates {
  if (!effectiveFrom) return undefined

  const from = parseISO(effectiveFrom)

  if (effectiveTo) {
    return { before: from, after: parseISO(effectiveTo) }
  }

  return { before: from }
}