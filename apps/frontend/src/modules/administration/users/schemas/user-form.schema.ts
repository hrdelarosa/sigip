import { z } from 'zod'

const usernameSchema = z
  .string()
  .trim()
  .toLowerCase()
  .min(3, 'El usuario debe tener al menos 3 caracteres')
  .max(50, 'El usuario no puede superar los 50 caracteres')
  .regex(
    /^[a-zA-Z0-9._-]+$/,
    'Use únicamente letras, números, puntos, guiones y guiones bajos',
  )

const fullNameSchema = z
  .string()
  .trim()
  .min(1, 'El nombre completo es obligatorio')
  .max(150, 'El nombre no puede superar los 150 caracteres')

const passwordSchema = z
  .string()
  .min(8, 'La contraseña debe tener al menos 8 caracteres')
  .max(255, 'La contraseña no puede superar los 255 caracteres')

export const createUserFormSchema = z.object({
  roleId: z.uuid('Seleccione un rol válido'),
  username: usernameSchema,
  fullName: fullNameSchema,
  password: passwordSchema,
})

export const updateUserFormSchema = z.object({
  roleId: z.uuid('Seleccione un rol válido'),
  username: usernameSchema,
  fullName: fullNameSchema,
})

export const changeUserPasswordFormSchema = z
  .object({
    password: passwordSchema,
    confirmPassword: z.string(),
  })
  .refine((values) => values.password === values.confirmPassword, {
    message: 'Las contraseñas no coinciden',
    path: ['confirmPassword'],
  })

export type CreateUserFormValues = z.infer<typeof createUserFormSchema>
export type UpdateUserFormValues = z.infer<typeof updateUserFormSchema>
export type ChangeUserPasswordFormValues = z.infer<
  typeof changeUserPasswordFormSchema
>
