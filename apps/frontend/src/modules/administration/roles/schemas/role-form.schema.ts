import { z } from 'zod'

export const createRoleFormSchema = z.object({
  code: z
    .string()
    .trim()
    .min(3, 'El código debe tener al menos 3 caracteres')
    .max(50, 'El código no puede superar los 50 caracteres'),
  name: z
    .string()
    .trim()
    .min(3, 'El nombre debe tener al menos 3 caracteres')
    .max(100, 'El nombre no puede superar los 100 caracteres'),
  description: z
    .string()
    .trim()
    .max(355, 'La descripción no puede superar los 355 caracteres')
    .optional(),
})

export const updateRoleFormSchema = createRoleFormSchema.omit({ code: true })

export type CreateRoleFormValues = z.infer<typeof createRoleFormSchema>
export type UpdateRoleFormValues = z.infer<typeof updateRoleFormSchema>
