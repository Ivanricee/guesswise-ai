import { z } from 'zod'

export const GuessWordSchema = z.object({
  guessWord: z
    .string({
      required_error: 'Escribe un personaje de terror o relacionado con Halloween.',
    })
    .min(2, {
      message: 'El personaje debe tener al menos 2 caracteres',
    })
    .max(40, {
      message: 'El personaje no puede tener mas de 40 caracteres',
    }),
  guessPlayerWord: z
    .string({
      required_error: 'Adivina el personaje de terror o relacionado con la imagen dada.',
    })
    .min(2, {
      message: 'El personaje debe tener al menos 2 caracteres',
    })
    .max(40, {
      message: 'El personaje no puede tener mas de 40 caracteres',
    }),
})
