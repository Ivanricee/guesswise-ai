/* eslint-disable react-hooks/exhaustive-deps */
import { useForm } from 'react-hook-form'
import { Alert, AlertTitle } from '../ui/alert'
import { Button } from '../ui/button'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '../ui/form'
import { Input } from '../ui/input'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useEffect, useState } from 'react'
import { ReplaceImageSchema } from '@/app/schema/replaceImage-schema'
import { replaceImage } from '@/app/actions/openai'
import { useAppStore } from '@/store/zustand-store'

interface GuessImgProps {
  onReplaceImg: ({ replacedImgUrl }: { replacedImgUrl: string }) => void
  playerImageUrl: string
  imageMask: File | null
  isformStep2: boolean | null
  children?: React.ReactNode
}

export default function ImageReplaceForm({
  onReplaceImg,
  playerImageUrl,
  imageMask,
  isformStep2,
  children,
}: GuessImgProps) {
  const { openAiKey } = useAppStore()
  const [isvalidating, setIsvalidating] = useState(false)
  const [aiValidation, setAiValidation] = useState<{
    replacedImgUrl: string
    error?: string | null
  }>({
    replacedImgUrl: '',
    error: null,
  })

  const defaultValues = {
    description: '',
    imageMask: '',
  }
  const form = useForm<z.infer<typeof ReplaceImageSchema>>({
    resolver: zodResolver(ReplaceImageSchema),
    defaultValues,
  })
  const onSubmitReplaceImage = async (data: z.infer<typeof ReplaceImageSchema>) => {
    setIsvalidating(true)
    const formdata = new FormData()
    const description = data.description
    const imageMaskText = data.imageMaskText

    formdata.append('openAiKey', openAiKey || '')
    formdata.append('description', description)
    formdata.append('imageMaks', imageMask || '')
    formdata.append('imageMaskText', imageMaskText)
    formdata.append('image', playerImageUrl)

    const { replacedImgUrl, error } = await replaceImage(formdata)
    setAiValidation({ replacedImgUrl, error })
    setIsvalidating(false)

    if (!error) onReplaceImg({ replacedImgUrl })
  }
  useEffect(() => {
    form.setValue('imageMaskText', imageMask ? 'image mask' : '')
    form.trigger('imageMaskText')
  }, [imageMask])
  return (
    <section>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmitReplaceImage)} className="flex flex-col gap-2">
          <FormField
            control={form.control}
            name="imageMaskText"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Dibuja la parte que quieres remplazar</FormLabel>
                <FormControl>
                  <div>
                    <Input {...field} type="text" />
                    {children}
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Describe el cambio que quieres hacer</FormLabel>
                <FormControl>
                  <Input
                    placeholder="maquilla el rostro blanco como un espectro"
                    {...field}
                    autoFocus
                    type="text"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <section>
            {isformStep2 === false && (
              <Alert
                variant="destructive"
                className="mt-4 flex flex-col justify-center bg-red-400/10 text-sm text-red-500/80"
              >
                <AlertTitle>Tienes que realizar un cambio a la imagen</AlertTitle>
              </Alert>
            )}
            {aiValidation.error && (
              <Alert
                variant="destructive"
                className="mt-4 flex flex-col justify-center bg-red-400/10 text-sm text-red-500/80"
              >
                <AlertTitle> No pudo generar la imagen</AlertTitle>
              </Alert>
            )}
          </section>
          <div className="flex items-center justify-center">
            <Button
              type="submit"
              disabled={isvalidating || !form.formState.isValid || form.formState.isValidating}
            >
              {isvalidating ? 'Generando...' : 'Generar imagen'}
            </Button>
          </div>
        </form>
      </Form>
    </section>
  )
}
