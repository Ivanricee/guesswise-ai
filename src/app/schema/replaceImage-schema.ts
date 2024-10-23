import { z } from 'zod'

export const ReplaceImageSchema = z
  .object({
    description: z
      .string({
        required_error: 'Describe lo que quieres remplazar en la imágen.',
      })
      .min(5, {
        message: 'La descripcion del objeto debe tener al menos 2 caracteres',
      })
      .max(200, {
        message: 'La descripcion del objeto no puede tener mas de 200 caracteres',
      }),
    imageMaskText: z
      .string({
        required_error: 'Necesitas guardar la imagen para poder continuar',
      })
      .min(5, {
        message: 'Necesitas guardar la imagen para poder continuar',
      }),
  })
  .required()
