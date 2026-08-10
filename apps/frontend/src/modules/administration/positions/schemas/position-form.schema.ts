import { z } from 'zod'

export const createPositionFormSchema = z.object({
  code: z
    .string()
    .trim()
    .min(3, 'El código debe tener al menos 3 caracteres')
    .max(50, 'El código no puede superar los 50 caracteres'),
  name: z
    .string()
    .trim()
    .min(3, 'El nombre debe tener al menos 3 caracteres')
    .max(150, 'El nombre no puede superar los 150 caracteres'),
  description: z
    .string()
    .trim()
    .max(355, 'La descripción no puede superar los 355 caracteres')
    .optional(),
})

export const updatePositionFormSchema = createPositionFormSchema.omit({
  code: true,
})

export type CreatePositionFormValues = z.infer<typeof createPositionFormSchema>
export type UpdatePositionFormValues = z.infer<typeof updatePositionFormSchema>
