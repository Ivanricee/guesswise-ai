import { z } from 'zod'

export const OpenAiSchema = z.object({
  openAiKey: z
    .string({
      required_error: 'Ingresa tu API Key de OpenAI',
    })
    .min(10, {
      message: 'La api no puede estar vacia',
    })
    .max(200)
    .refine(
      (value) => {
        if (!/\s/.test(value)) return true // just spaces
        if (/^\s+|\s+$/.test(value)) return false //start/end with spaces
        return true
      },
      {
        message:
          'La api debe no estar vacia, con espacios solamente, o empezar/terminar con espacios.',
      }
    ),
})
