/* eslint-disable @typescript-eslint/no-explicit-any */
'use server'
import { isValidCharacterPromt, OPENAI_KEY, validCharacterPromt } from '@/lib/openai'
import { OpenAiSchema } from '../schema/openAi-schema'
import { OpenAI, toFile } from 'openai'
import { createOpenAI } from '@ai-sdk/openai'
import { generateObject } from 'ai'
import { z } from 'zod'
import { GuessWordSchema } from '../schema/guessWord-schema'
import { ReplaceImageSchema } from '../schema/replaceImage-schema'
import { Readable } from 'stream'

export type replaceImageRes = {
  replacedImgUrl: string
  error: string | null
}
export async function replaceImage(formData: FormData): Promise<replaceImageRes> {
  'use server'
  const description = formData.get('description') as string
  const openAiKey = formData.get('openAiKey') as string
  const imageMaks = formData.get('imageMaks') as File
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const imageMaksText = formData.get('imageMaksText') as File
  const image = formData.get('image') as string

  //validate form
  const data = Object.fromEntries(formData) as Record<string, FormDataEntryValue>
  const parseData = await ReplaceImageSchema.safeParseAsync({
    ...data,
  })
  const validateSuccess = parseData.success
  const keyError = parseData.error
  if (!validateSuccess) {
    console.log('keys validation error', keyError)
    return {
      replacedImgUrl: '',
      error: 'Imagen o descripcion invalida',
    }
  }
  //validate con ia
  const apiKey = openAiKey.length > 0 ? openAiKey : OPENAI_KEY

  const openai = new OpenAI({
    apiKey: apiKey,
  })

  //validate replace input
  const { replacedImgUrl, error } = await dalleEditImage(imageMaks, image, description, openai)
  /*return {
    replacedImgUrl:
      'https://oaidalleapiprodscus.blob.core.windows.net/private/org-O8kAuShP2s8BXrDJJb0Ye51q/user-XHFsUE9mN3DLUCYoZdLpyWvm/img
      -cqEM9F2Ud1fxowZpvMzoc3cO.png?st=2024-10-22T20%3A07%3A12Z&se=2024-10-22T22%3A07%3A12Z&sp=r&sv=2024-08-04&sr=b&rscd=inline&r
      sct=image/png&skoid=d505667d-d6c1-4a0a-bac7-5c84a87759f8&sktid=a48cca56-e6da-484e-a814-9c849652bcb3&skt=2024-10-21T21%3A49%3A
      04Z&ske=2024-10-22T21%3A49%3A04Z&sks=b&skv=2024-08-04&sig=enob%2BhvT2jA3iaAspwfZnaAvn/SKaCRmOUxCtvQMTjU%3D',
    error: null,
  }*/

  return { replacedImgUrl, error: error ?? null }
}
async function dalleEditImage(imageMaks: File, image: string, description: string, openai: OpenAI) {
  'use server'

  const imageArraybuffer = await imageToArrayBuffer(image)
  const imageMskArraybuffer = await imageMaks.arrayBuffer()

  const imageBuffer = Buffer.from(imageArraybuffer)
  const imageMskBuffer = Buffer.from(imageMskArraybuffer)

  const readableImage = await toFile(Readable.from(imageBuffer), 'image.png')
  const readableMskImage = await toFile(Readable.from(imageMskBuffer), 'mskImage.png')
  try {
    const response = await openai.images.edit({
      model: 'dall-e-2',
      image: readableImage,
      mask: readableMskImage,
      prompt: description,
      size: '1024x1024',
      n: 1,
      response_format: 'url',
    })
    const replacedImgUrl = response.data[0].url || ''
    return {
      replacedImgUrl,
    }
  } catch (err) {
    console.log('dalle salio mal: ', err)
    return {
      replacedImgUrl: '',
      error: 'Error al generar imagen',
    }
  }
}

export type GuessWordVal = {
  invalidCharacter: string
  characterGuess: string
  isValidPlayerGuess: boolean | null
  error?: string
}
export async function validateGuessWord(formData: FormData): Promise<GuessWordVal> {
  'use server'
  const openAikey = formData.get('openAiKey') as string
  const wordToGuess = formData.get('guessWord') as string
  const toGuessPlayerWord = formData.get('toGuessPlayerWord') as string
  const guessPlayerWord = formData.get('guessPlayerWord') as string
  const validatePlayerGuess = formData.get('validatePlayerGuess') as string
  const shouldValidateWords = validatePlayerGuess === 'ok'

  //validate form
  const data = Object.fromEntries(formData) as Record<string, FormDataEntryValue>
  const parseData = await GuessWordSchema.safeParseAsync({
    ...data,
  })
  const validateSuccess = parseData.success
  const keyError = parseData.error
  if (!validateSuccess) {
    console.log('keys validation error', keyError)
    return {
      characterGuess: '',
      invalidCharacter: '',
      isValidPlayerGuess: null,
      error: 'Personaje invalido',
    }
  }
  //validate con ia
  const apiKey = openAikey.length > 0 ? openAikey : OPENAI_KEY

  const sdkOpenai = createOpenAI({
    apiKey,
  })

  //validate input character
  const { invalidCharacter, validCharacter, error } = await guessCharacter(wordToGuess, sdkOpenai)
  //validate character guess if not first round
  if (shouldValidateWords) {
    const { isValid, errorChar } = await isValidCharacter(
      toGuessPlayerWord,
      guessPlayerWord,
      sdkOpenai
    )
    const cError = errorChar || error
    return {
      invalidCharacter,
      characterGuess: validCharacter,
      error: cError,
      isValidPlayerGuess: isValid,
    }
  }
  return { invalidCharacter, characterGuess: validCharacter, error, isValidPlayerGuess: null }
}

async function isValidCharacter(
  toGuessPlayerWord: string,
  guessPlayerWord: string,
  sdkOpenai: any
) {
  'use server'
  const model = 'gpt-4o-mini'
  const prompt = isValidCharacterPromt({
    character: toGuessPlayerWord,
    guessCharacter: guessPlayerWord,
  })
  try {
    const result = await generateObject({
      model: sdkOpenai(model),
      schema: z.object({
        isValidCharacter: z.boolean(),
      }),
      prompt,
    })
    return {
      isValid: result.object.isValidCharacter,
    }
  } catch (err) {
    console.log('Salio mal: ', err)
    return {
      isValid: false,
      errorChar: 'Error al generar respuesta',
    }
  }
}
async function guessCharacter(wordToGuess: string, sdkOpenai: any) {
  'use server'
  const model = 'gpt-4o-mini'
  const prompt = validCharacterPromt({ character: wordToGuess })
  try {
    const result = await generateObject({
      model: sdkOpenai(model),
      schema: z.object({
        valid: z.string().default('').optional().describe('Only when valid characters'),
        invalid: z.string().default('').optional().describe('only when invalid characters'),
      }),
      prompt,
      maxTokens: 100,
    })
    return {
      invalidCharacter: result.object.invalid || '',
      validCharacter: result.object.valid || '',
    }
  } catch (err) {
    console.log('Salio mal: ', err)
    return {
      invalidCharacter: '',
      validCharacter: '',
      error: 'Error al generar respuesta',
    }
  }
}

export async function getOpenAiKey(formData: FormData) {
  'use server'
  const openAiKey = formData.get('openAiKey') as string

  const data = Object.fromEntries(formData) as Record<string, FormDataEntryValue>
  const parseData = await OpenAiSchema.safeParseAsync({
    ...data,
  })
  const validateSuccess = parseData.success
  const keyError = parseData.error
  if (!validateSuccess) {
    console.log('Open Ai KEY Error', keyError)
    return { isOpenAiValidKey: false }
  }
  const isOpenAiValidKey = await validateOpenAiKey(openAiKey)
  return { isOpenAiValidKey: isOpenAiValidKey }
}
const validateOpenAiKey = async (apiKey: string) => {
  'use server'
  try {
    if (apiKey) {
      const openai = new OpenAI({
        apiKey: apiKey,
      })
      await openai.models.list()
      return true
    }
    return false
  } catch (e: any) {
    console.log('Authentication error', e.message)
    return false
  }
}

async function imageToArrayBuffer(url: string) {
  try {
    // Fetch la imagen desde la URL
    const response = await fetch(url)

    // Verificar si la respuesta es válida
    if (!response.ok) {
      throw new Error(`Error fetching the image: ${response.statusText}`)
    }

    // Convertir la respuesta en un ArrayBuffer
    const arrayBuffer = await response.arrayBuffer()
    return arrayBuffer
  } catch (error) {
    console.error('Error al convertir la imagen:', error)
    throw error
  }
}
