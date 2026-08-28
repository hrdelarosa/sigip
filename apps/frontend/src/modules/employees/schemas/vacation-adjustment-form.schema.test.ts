import { describe, expect, it } from 'vitest'
import { vacationAdjustmentFormSchema } from './vacation-adjustment-form.schema'

describe('vacationAdjustmentFormSchema', () => {
  it('accepts positive and negative non-zero adjustments', () => {
    expect(
      vacationAdjustmentFormSchema.safeParse({
        year: '2026',
        period: 'FIRST',
        daysDelta: '3',
        reason: 'Consumo previo',
      }).success,
    ).toBe(true)
    expect(
      vacationAdjustmentFormSchema.safeParse({
        year: '2026',
        period: 'SECOND',
        daysDelta: '-2',
        reason: 'Corrección documentada',
      }).success,
    ).toBe(true)
  })

  it('rejects zero and values outside the allowed range', () => {
    for (const daysDelta of ['0', '11', '-11']) {
      expect(
        vacationAdjustmentFormSchema.safeParse({
          year: '2026',
          period: 'FIRST',
          daysDelta,
          reason: 'Ajuste inválido',
        }).success,
      ).toBe(false)
    }
  })
})
