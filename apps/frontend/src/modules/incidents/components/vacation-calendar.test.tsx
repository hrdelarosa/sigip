import type { ReactNode } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { useForm } from 'react-hook-form'
import { afterEach, describe, expect, it, vi } from 'vitest'
import type { IncidentTemporalMode } from '@sigip/shared'

import { DatePicker } from '@/components/ui/date-picker'
import type { IncidentFormValues } from '../schemas/incident-form.schema'
import { IncidentOccurrencesField } from './IncidentOccurrencesField'
import { IncidentReceivedAtField } from './IncidentDatePickerField'
import { VacationDateCapture } from './VacationDateCapture'

// Render closed popover contents in the existing Node-only test environment.
vi.mock('@/components/ui/popover', () => ({
  Popover: ({ children }: { children: ReactNode }) => <>{children}</>,
  PopoverTrigger: ({ children }: { children: ReactNode }) => <>{children}</>,
  PopoverContent: ({ children }: { children: ReactNode }) => <>{children}</>,
}))

function Occurrences({
  code,
  mode = 'MULTIPLE_DATES',
  date = '',
}: {
  code: string
  mode?: IncidentTemporalMode
  date?: string
}) {
  const { control } = useForm<IncidentFormValues>({
    defaultValues: {
      assignmentEffectiveFrom: '2026-01-01',
      assignmentEffectiveTo: '2026-12-31',
      occurrences: [{ startDate: date, endDate: null }],
    },
  })
  return (
    <IncidentOccurrencesField
      control={control}
      temporalMode={mode}
      incidentTypeCode={code}
      configured
    />
  )
}

afterEach(() => vi.useRealTimers())

describe('vacation calendar navigation', () => {
  it.each([2026, 2027])('extends vacation dates two years beyond %i', (year) => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date(year, 9, 27))

    for (const code of [
      'VACACIONES_PRIMER_PERIODO',
      'VACACIONES_SEGUNDO_PERIODO',
      'VACACIONES_ESTIMULOS',
    ]) {
      const html = renderToStaticMarkup(<Occurrences code={code} />)
      expect(html).toContain(`value="${year + 2}"`)
      expect(html).not.toContain(`value="${year + 3}"`)
    }
  })

  it('opens January 2027 and December 2028 without clamping to 2026', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date(2026, 9, 27))

    for (const date of ['2027-01-15', '2028-12-15']) {
      const html = renderToStaticMarkup(
        <Occurrences code="VACACIONES_SEGUNDO_PERIODO" date={date} />,
      )
      expect(html).toContain(`data-day="${date}"`)
      const day = html.match(new RegExp(`<td[^>]*data-day="${date}"[^>]*>`))?.[0]
      expect(day).toContain('data-selected="true"')
      expect(day).not.toContain('data-disabled="true"')
      if (date === '2028-12-15') {
        const nextButton = html.match(/<button[^>]*rdp-button_next[^>]*>/)?.[0]
        expect(nextButton).toContain('aria-disabled="true"')
      }
    }
  })

  it('preserves assignment-disabled dates for vacation incentives', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date(2026, 9, 27))
    const html = renderToStaticMarkup(
      <Occurrences code="VACACIONES_ESTIMULOS" date="2028-12-15" />,
    )
    const day = html.match(/<td[^>]*data-day="2028-12-15"[^>]*>/)?.[0]
    expect(day).toContain('data-disabled="true"')
    expect(html).toContain('value="2028"')
  })

  it.each([2026, 2027])('extends both vacation range endpoints in %i', (year) => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date(year, 9, 27))
    const html = renderToStaticMarkup(
      <VacationDateCapture
        captureMode="RANGE"
        onCaptureModeChange={vi.fn()}
        onDatesChange={vi.fn()}
        occurrenceLimit={10}
        ordinaryVacation
        occurrencesCount={0}
      />,
    )
    expect(html.match(new RegExp(`value="${year + 2}"`, 'g'))).toHaveLength(2)
    expect(html).not.toContain(`value="${year + 3}"`)
  })

  it('keeps the current-year default for other occurrences, receipt and generic dates', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date(2026, 9, 27))
    const html = renderToStaticMarkup(
      <>
        <Occurrences code="COMISION" mode="DATE_RANGE" />
        <IncidentReceivedAtField id="received" value="" onChange={vi.fn()} />
        <DatePicker id="other" value="" onValueChange={vi.fn()} />
      </>,
    )
    expect(html.match(/value="2026"/g)).toHaveLength(4)
    expect(html).not.toContain('value="2027"')
  })
})
