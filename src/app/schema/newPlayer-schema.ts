import { z } from 'zod'
const MAX_FILE_SIZE = 1024 * 1024 * 5
const ACCEPTED_IMAGE_MIME_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
export const newPlayerSchema = z
  .object({
    name: z.string().min(3),
    image: z.any().optional(),
    optionalImg: z.array(z.string()).optional(),
  })
  .refine(
    (data) => {
      const hasImage = data.image === null && data.optionalImg?.length === 0
      if (hasImage) return false
      return true
    },
    {
      message: 'Por favor, sube una foto de perfil.',
      path: ['image'],
    }
  )
  .refine(
    (data) => {
      const correctMymeType = ACCEPTED_IMAGE_MIME_TYPES.includes(data.image?.[0]?.type)
      const hasImage = data.image === null

      if (!correctMymeType && !hasImage) return false
      return true
    },
    {
      message: 'Solo formatos .jpg, .jpeg, .png y .webp son compatibles.',
      path: ['image'],
    }
  )
  .refine(
    (data) => {
      const hasRigthSize = data.image?.[0]?.size <= MAX_FILE_SIZE
      const hasImage = data.image === null
      if (!hasRigthSize && !hasImage) return false
      return true
    },
    {
      message: 'Tamaño máximo de imagen es de 5MB.',
      path: ['image'],
    }
  )
