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

export default function NewPlayer() {
  const searchParams = useSearchParams()
  const inviteToken = searchParams.get('invitation')

  const { setPlayer } = useAppStore()
  const [playerError, setPlayerError] = useState<null | string>(null)
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
    const { error, isValidToken, imageUrl, uriToken } = await createPlayer(playerData)
    const player: Player = {
      name: data.name,
      imageUrl: imageUrl || '',
      isHost: !hasInvitation,
      isGuessing: false,
      isCurrent: true,
    }
    //handle response error
    if (error && error.length > 0)
      setPlayerError(
        `"${error}" Fallo al crear el jugador, intentalo de nuevo refrescando la página.`
      )
    //handle invitation player
    if (isValidToken && inviteToken) {
      //store current player
      setPlayer({ player, token: null })
    }
    //handle host player
    if (uriToken && uriToken.length > 0) {
      setPlayer({ player, token: uriToken })
    }
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
  return (
    <section>
      <h2>{playerError}</h2>
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
            <Button type="submit" disabled={!form.formState.isValid || form.formState.isValidating}>
              Submit
            </Button>
          </div>
        </form>
      </Form>
    </section>
  )
}