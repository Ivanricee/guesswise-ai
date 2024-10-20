/* eslint-disable @typescript-eslint/no-explicit-any */
'use server'
import { OpenAiSchema } from '../schema/openAi-schema'
import { OpenAI } from 'openai'
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
