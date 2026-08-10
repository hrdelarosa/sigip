import { z } from 'zod'

export const createOrganizationalUnitFormSchema = z.object({
  parentId: z.string().uuid().nullable(),
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
  sortOrder: z
    .number()
    .int('El orden de clasificación debe ser un número entero')
    .min(0, 'El orden de clasificación no puede ser negativo')
    .max(1_000_000, 'El orden de clasificación no puede superar 1,000,000')
    .optional(),
})

export const updateOrganizationalUnitFormSchema =
  createOrganizationalUnitFormSchema.omit({
    code: true,
  })

export type CreateOrganizationalUnitFormValues = z.infer<
  typeof createOrganizationalUnitFormSchema
>
export type UpdateOrganizationalUnitFormValues = z.infer<
  typeof updateOrganizationalUnitFormSchema
>
