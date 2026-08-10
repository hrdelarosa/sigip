import { z } from 'zod'
import { isMatch } from 'date-fns'

const optionalDate = z
  .string()
  .trim()
  .refine(
    (value) => value === '' || isMatch(value, 'yyyy-MM-dd'),
    'Ingresa una fecha válida',
  )
  .transform((value) => value || null)

export const createEmployeeFormSchema = z.object({
  employeeNumber: z
    .string()
    .trim()
    .min(1, 'El número de empleado es obligatorio')
    .max(50, 'El número de empleado no puede superar los 50 caracteres'),
  fullName: z
    .string()
    .trim()
    .min(1, 'El nombre completo es obligatorio')
    .max(200, 'El nombre completo no puede superar los 200 caracteres'),
  hireDate: optionalDate,
})

export const updateEmployeeFormSchema = createEmployeeFormSchema

export type CreateEmployeeFormValues = z.infer<typeof createEmployeeFormSchema>
export type UpdateEmployeeFormValues = z.infer<typeof updateEmployeeFormSchema>
