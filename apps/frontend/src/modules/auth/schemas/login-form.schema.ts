import { z } from 'zod'

export const loginFormSchema = z.object({
  username: z
    .string()
    .trim()
    .min(1, 'Ingrese su nombre de usuario')
    .max(50, 'El usuario no puede exceder 50 caracteres'),
  password: z
    .string()
    .min(1, 'Ingrese su contraseña')
    .max(255, 'La contraseña no puede exceder 255 caracteres'),
})

export type LoginFormValues = z.infer<typeof loginFormSchema>
