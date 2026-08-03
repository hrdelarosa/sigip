import { z } from 'zod'

export const createPermissionFormSchema = z.object({
  code: z
    .string()
    .trim()
    .min(1, { message: 'El código es requerido' })
    .max(100, { message: 'El código no puede superar los 100 caracteres' })
    .regex(
      /^[a-z][a-z0-9-]*:[a-z][a-z0-9-]*$/,
      'Utiliza el formato correcto "module:action", por ejemplo "users:create"',
    ),

  description: z
    .string()
    .trim()
    .max(500, { message: 'La descripción no puede superar los 500 caracteres' })
    .optional(),
})

export const updatePermissionFormSchema = createPermissionFormSchema.omit({
  code: true,
})

export type CreatePermissionFormValues = z.infer<
  typeof createPermissionFormSchema
>
export type UpdatePermissionFormValues = z.infer<
  typeof updatePermissionFormSchema
>
