/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'

import { newPlayerSchema } from '@/app/schema/newPlayer-schema'
import Dropzone, { DropzoneRootProps } from 'react-dropzone'
import { zodResolver } from '@hookform/resolvers/zod'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from './ui/form'
import { z } from 'zod'
import { Input } from './ui/input'
import { Button } from './ui/button'
import { useForm } from 'react-hook-form'
import Image from 'next/image'
import { createPlayer } from '@/app/actions/player'
import { Checkbox } from './ui/checkbox'
import { testImages } from '@/lib/testImage'
import { useSearchParams } from 'next/navigation'
import { Player, useAppStore } from '@/store/zustand-store'
import { useState } from 'react'
import { usePlayerLimit } from './hooks/usePlayerLimit'
import ShareToken from './ShareToken'

export default function NewPlayer() {
  const searchParams = useSearchParams()
  const inviteToken = searchParams.get('invitation')
  const { isInlimit } = usePlayerLimit({ token: inviteToken ?? null })
  const { setPlayer, token } = useAppStore()
  const [playerError, setPlayerError] = useState<null | string>(null)
  const [validTags, setValidTags] = useState<boolean | null>()
  const form = useForm<z.infer<typeof newPlayerSchema>>({
    resolver: zodResolver(newPlayerSchema),
    defaultValues: {
      name: '',
      image: null,
      optionalImg: [],
    },
  })

  const onSubmitPlayer = async (data: z.infer<typeof newPlayerSchema>) => {
    const playerData = new FormData()
    const hasInvitation = inviteToken !== null
    playerData.append('name', data.name)
    if (data.image) {
      playerData.append('image', data.image[0])
    } else {
      playerData.append('image', '')
    }

    if (data.optionalImg && data.optionalImg[0]) {
      playerData.append('imageAssetId', data.optionalImg[0])
    } else {
      playerData.append('imageAssetId', '')
    }
    //if url has no token is host
    if (hasInvitation) {
      playerData.append('token', inviteToken)
    } else {
      playerData.append('token', '')
    }
    //player creation
    const { error, isValidToken, imageUrl, uriToken, tags, areValidTags } =
      await createPlayer(playerData)
    const player: Player = {
      date: Date.now(),
      name: data.name,
      imageUrl: imageUrl || '',
      tags: tags || [],
      isHost: !hasInvitation,
      isGuessing: true,
      isCurrent: true,
    }
    //handle min Tags
    if (areValidTags === false) {
      form.setValue('image', null)
      form.setValue('optionalImg', [])
      setValidTags(false)
    }

    //handle error
    if (error && error.length > 0)
      setPlayerError(
        `"${error}" Fallo al crear el jugador, intentalo de nuevo refrescando la página.`
      )
    //invitation player
    if (isValidToken && inviteToken) setPlayer({ player, token: null })
    //host player
    if (uriToken && uriToken.length > 0) setPlayer({ player, token: uriToken })
  }

  const onDropChange = (onChange: any, file: any) => {
    onChange(file)
    if (file.length > 0) form.setValue('optionalImg', [])
  }
  const onImageChange = (checked: boolean | string, field: any, item: any) => {
    if (checked) form.setValue('image', null)

    return checked
      ? field.onChange([item.asset_id]) // Si se selecciona, se establece el valor como item.id
      : field.onChange([]) // Si se deselecciona, se establece como null
  }
  const uriToken = inviteToken ? `?invitation=${inviteToken}` : ''
  if (playerError) {
    return (
      <section>
        <h2>{playerError}</h2>
      </section>
    )
  }
  if (isInlimit === true) {
    return (
      <>
        <section>
          {validTags === false && (
            <div>
              <h2>La imagen no es la adecuada, elige otra con mas objetos</h2>
            </div>
          )}
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmitPlayer)}>
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nombre</FormLabel>
                    <FormControl>
                      <Input placeholder="ivanrice" {...field} maxLength={20} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="image"
                render={({ field: { onChange, onBlur, value } }) => (
                  <FormItem>
                    <FormLabel>Upload an Image</FormLabel>
                    <FormControl>
                      <section>
                        <Dropzone onDrop={(file) => onDropChange(onChange, file)} maxFiles={1}>
                          {({ getRootProps, getInputProps }) => (
                            <div {...getRootProps()} className="border-2 border-primary p-6">
                              <Input {...getInputProps()} onBlur={onBlur} />
                              <p>Arrastra tu foto aquí o haz click para subirla</p>
                              {value &&
                                value.map((file: DropzoneRootProps) => (
                                  <div key={file.path}>
                                    {file.path}{' '}
                                    <Image
                                      src={`${URL.createObjectURL(file as File)}`}
                                      alt=""
                                      width={100}
                                      height={100}
                                    />
                                  </div>
                                ))}
                            </div>
                          )}
                        </Dropzone>
                      </section>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="optionalImg"
                render={() => (
                  <div className="flex  p-2">
                    {testImages.map((item) => (
                      <FormField
                        key={item.asset_id}
                        control={form.control}
                        name="optionalImg"
                        render={({ field }) => {
                          return (
                            <FormItem
                              key={item.asset_id}
                              className="flex flex-row items-start space-x-3 space-y-0"
                            >
                              <FormControl>
                                <Checkbox
                                  checked={field.value?.includes(item.asset_id)}
                                  onCheckedChange={(checked) => onImageChange(checked, field, item)}
                                />
                              </FormControl>
                              <FormLabel className="text-sm font-normal">
                                <div>
                                  <Image src={item.url} alt="" width={100} height={100} />
                                </div>
                              </FormLabel>
                            </FormItem>
                          )
                        }}
                      />
                    ))}
                    <FormMessage />
                  </div>
                )}
              />
              <div className="flex items-center justify-center">
                <Button
                  type="submit"
                  disabled={!form.formState.isValid || form.formState.isValidating}
                >
                  Submit
                </Button>
              </div>
            </form>
          </Form>
        </section>
        <section>{token && <ShareToken token={token} />}</section>
      </>
    )
  }
  if (isInlimit === false) {
    return (
      <section>
        <h1>Esta sala esta llena</h1>
      </section>
    )
  }
}
