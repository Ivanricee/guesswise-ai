import { useForm } from 'react-hook-form'
import { Alert, AlertTitle } from '../ui/alert'
import { Button } from '../ui/button'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '../ui/form'
import { Input } from '../ui/input'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { GuessWordSchema } from '@/app/schema/guessWord-schema'
import { validateGuessWord } from '@/app/actions/openai'
import { useEffect, useState } from 'react'
import { useAppStore } from '@/store/zustand-store'
import { OnGuessWord } from '.'

interface GuessWordProps {
  onGuessWord: ({ characterGuess, isValidPlayerGuess, guessWord }: OnGuessWord) => void
  isformStep1: null | boolean
  toGuessPlayerWord: string | null
  isfirstRound: boolean
}

export default function GuessWord({
  onGuessWord,
  isformStep1,
  toGuessPlayerWord,
  isfirstRound,
}: GuessWordProps) {
  const { openAiKey } = useAppStore()
  const [isvalidating, setIsvalidating] = useState(false)
  const [aiValidation, setAiValidation] = useState<{
    invalidCharacter: string
    characterGuess: string
    isValidPlayerGuess: boolean | null
    error?: string | null
  }>({
    invalidCharacter: '',
    characterGuess: '',
    isValidPlayerGuess: null,
    error: null,
  })
  console.log('GUESS WORD IS FIRST', { isfirstRound })

  const defaultValues = {
    guessWord: '',
    guessPlayerWord: '',
  }
  const form = useForm<z.infer<typeof GuessWordSchema>>({
    resolver: zodResolver(GuessWordSchema),
    defaultValues,
  })
  const onSubmitGuessWord = async (data: z.infer<typeof GuessWordSchema>) => {
    setIsvalidating(true)
    const formdata = new FormData()
    const guessWord = data.guessWord
    const guessPlayerWord = data.guessPlayerWord
    formdata.append('guessWord', guessWord)
    formdata.append('toGuessPlayerWord', toGuessPlayerWord || '')
    formdata.append('guessPlayerWord', guessPlayerWord)
    formdata.append('openAiKey', openAiKey || '')
    formdata.append('validatePlayerGuess', isfirstRound ? '' : 'ok')
    const { invalidCharacter, characterGuess, error, isValidPlayerGuess } =
      await validateGuessWord(formdata)
    setAiValidation({ invalidCharacter, characterGuess, error, isValidPlayerGuess })
    setIsvalidating(false)

    if (!error) onGuessWord({ characterGuess, guessWord, isValidPlayerGuess })
  }
  useEffect(() => {
    console.log('GUESS WORD IS FIRST', { isfirstRound })
    form.setValue('guessPlayerWord', isfirstRound ? 'firstRound' : '')
    form.trigger('guessPlayerWord')
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isfirstRound])
  const showGuessPWord = isfirstRound ? false : true
  return (
    <section>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmitGuessWord)} className="flex flex-col gap-2">
          <FormField
            control={form.control}
            name="guessWord"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Personaje (Terror o Halloween)</FormLabel>
                <FormControl>
                  <Input placeholder="Annabelle" {...field} autoFocus type="text" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="guessPlayerWord"
            render={({ field }) => (
              <FormItem>
                {showGuessPWord && (
                  <FormLabel>Adivina el personaje de terror relacionado con la imagen</FormLabel>
                )}
                <FormControl>
                  <Input
                    placeholder="chucky"
                    {...field}
                    type={showGuessPWord ? 'text' : 'hidden'}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <section>
            {aiValidation.characterGuess.length > 0 && (
              <Alert
                variant="success"
                className="mt-4 flex flex-col justify-center bg-green-500/10 text-sm"
              >
                <AlertTitle> {aiValidation.characterGuess}</AlertTitle>
              </Alert>
            )}
            {aiValidation.invalidCharacter.length > 0 && (
              <Alert
                variant="destructive"
                className="mt-4 flex flex-col justify-center bg-red-400/10 text-sm text-red-500/80"
              >
                <AlertTitle> {aiValidation.invalidCharacter}</AlertTitle>
              </Alert>
            )}

            {isformStep1 === false && (
              <Alert
                variant="destructive"
                className="mt-4 flex flex-col justify-center bg-red-400/10 text-sm text-red-500/80"
              >
                <AlertTitle>
                  Tienes que escribir una personaje relacionado con la imagen a editar
                </AlertTitle>
              </Alert>
            )}
            {aiValidation.error && (
              <Alert
                variant="destructive"
                className="mt-4 flex flex-col justify-center bg-red-400/10 text-sm text-red-500/80"
              >
                <AlertTitle> {aiValidation.invalidCharacter}</AlertTitle>
              </Alert>
            )}
          </section>
          <div className="flex items-center justify-center">
            <Button
              type="submit"
              disabled={isvalidating || !form.formState.isValid || form.formState.isValidating}
            >
              {isvalidating ? 'validando...' : 'Validar'}
            </Button>
          </div>
        </form>
      </Form>
    </section>
  )
}
