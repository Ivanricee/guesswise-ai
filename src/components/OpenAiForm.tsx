'use client'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'
import { OpenAiSchema } from '@/app/schema/openAi-schema'
import { z } from 'zod'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from './ui/form'
import { Input } from './ui/input'
import { Button } from './ui/button'
import { getOpenAiKey } from '@/app/actions/openai'
import { Alert, AlertTitle } from './ui/alert'
import { useState } from 'react'
import { useAppStore } from '@/store/zustand-store'

export default function OpenAiForm() {
  const [isValidOpenAi, setIsValidOpenAi] = useState<boolean | null>(null)
  const { setOpenAiKey } = useAppStore()
  const defaultValues = {
    openAiKey: '',
  }
  const form = useForm<z.infer<typeof OpenAiSchema>>({
    resolver: zodResolver(OpenAiSchema),
    defaultValues,
  })
  const onSubmitKey = async (data: z.infer<typeof OpenAiSchema>) => {
    const formdata = new FormData()
    const openAiKey = data.openAiKey
    formdata.append('openAiKey', openAiKey)
    const { isOpenAiValidKey } = await getOpenAiKey(formdata)
    console.log({ isOpenAiValidKey })
    if (openAiKey) setOpenAiKey(openAiKey)
    setIsValidOpenAi(isOpenAiValidKey)
  }

  return (
    <Card className={'h-full bg-card/60 shadow-none '}>
      <CardHeader>
        <CardTitle className="mb-4 px-0.5">Configura OpenAI (opcional).</CardTitle>
        <CardDescription>
          Utiliza OpenAI para generación de texto y DALL-E para creación de imágenes.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmitKey)} className="flex flex-col gap-8">
            <FormField
              control={form.control}
              name="openAiKey"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="font-archivoNarrow">OpenAi Key</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="sk-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                      {...field}
                      autoFocus
                      type="password"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex items-center justify-center">
              <Button
                type="submit"
                disabled={!form.formState.isValid || form.formState.isValidating}
              >
                {form.formState.isValidating ? 'validating...' : 'Validate'}
              </Button>
            </div>
          </form>
        </Form>
        <section>
          {isValidOpenAi === null ? null : isValidOpenAi ? (
            <Alert
              variant="success"
              className="mt-4 flex flex-col justify-center bg-green-500/10 text-sm"
            >
              <AlertTitle> API key válida</AlertTitle>
            </Alert>
          ) : (
            <Alert
              variant="destructive"
              className="mt-4 flex flex-col justify-center bg-red-400/10 text-sm text-red-500/80"
            >
              <AlertTitle> API key inválida</AlertTitle>
            </Alert>
          )}
        </section>
      </CardContent>
    </Card>
  )
}
