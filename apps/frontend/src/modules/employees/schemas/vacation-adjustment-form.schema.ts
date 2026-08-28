import { z } from 'zod'

export const vacationAdjustmentFormSchema = z.object({
  year: z
    .string()
    .regex(/^\d{4}$/, 'Indique un año válido')
    .refine(
      (value) => Number(value) >= 2000 && Number(value) <= 2100,
      'Indique un año entre 2000 y 2100',
    ),
  period: z.enum(['FIRST', 'SECOND']),
  daysDelta: z
    .string()
    .regex(/^-?\d+$/, 'Indique una cantidad entera')
    .refine((value) => Number(value) !== 0, 'El ajuste no puede ser cero')
    .refine(
      (value) => Number(value) >= -10 && Number(value) <= 10,
      'El ajuste debe estar entre -10 y 10 días',
    ),
  reason: z
    .string()
    .trim()
    .min(3, 'Explique el motivo del ajuste')
    .max(500, 'Máximo 500 caracteres'),
})

export type VacationAdjustmentFormValues = z.infer<
  typeof vacationAdjustmentFormSchema
>
