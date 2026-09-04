import { isMatch } from 'date-fns'
import { z } from 'zod'

const calendarDate = z
  .string()
  .trim()
  .min(1, 'La fecha de inicio es obligatoria')
  .refine((value) => isMatch(value, 'yyyy-MM-dd'), 'Ingresa una fecha válida')

const optionalCalendarDate = z
  .string()
  .trim()
  .refine(
    (value) => value === '' || isMatch(value, 'yyyy-MM-dd'),
    'Ingresa una fecha válida',
  )
  .transform((value) => value || null)

const nullableText = (maximum: number, message: string) =>
  z
    .string()
    .trim()
    .max(maximum, message)
    .transform((value) => value || null)

export const employeeAssignmentFormSchema = z
  .object({
    organizationalUnitId: z
      .string()
      .uuid('Selecciona una unidad válida')
      .or(z.literal(''))
      .transform((value) => value || null),
    positionId: z.string().uuid('Selecciona un puesto válido'),
    appointmentType: z.enum(['BASE', 'CONFIANZA']),
    schedule: nullableText(150, 'El horario no puede superar los 150 caracteres'),
    effectiveFrom: calendarDate,
    effectiveTo: optionalCalendarDate,
    notes: nullableText(5000, 'Las notas no pueden superar los 5000 caracteres'),
  })
  .refine(
    ({ effectiveFrom, effectiveTo }) =>
      !effectiveTo || effectiveTo >= effectiveFrom,
    {
      path: ['effectiveTo'],
      message: 'La fecha de fin debe ser igual o posterior a la de inicio',
    },
  )

export type EmployeeAssignmentFormValues = z.infer<
  typeof employeeAssignmentFormSchema
>
