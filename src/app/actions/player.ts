'use server'

import { CloudinaryImage, uploadToCloudinary } from '@/lib/cloudinary'
import { testImages } from '@/lib/testImage'
import { DropzoneRootProps } from 'react-dropzone'
import { createToken, verifyToken } from './token'
import { supabaseClient, UserPresence } from '@/lib/supabase'

export type tokenStatus = {
  isValidToken?: boolean | null
  uriToken?: string | null
  imageUrl?: string | null
  error?: string
  room?: string
}

export async function createPlayer(playerData: FormData): Promise<tokenStatus> {
  'use server'
  const user = playerData.get('name') as string
  const imageFile = playerData.get('image') as DropzoneRootProps | string
  const imageAssetId = playerData.get('imageAssetId')
  const token = playerData.get('token') as string
  const isHost = token.length === 0

  if (typeof imageFile === 'string') {
    const resultImage = testImages.find((image) => image.asset_id === imageAssetId)
    if (!resultImage) throw new Error('No se encontraron imágenes de prueba')
    return resultPlayer({ resultImage, isHost, user, token })
  }

  const imageUpload = await uploadToCloudinary({ imageFile })
  if (imageUpload.result) {
    return resultPlayer({ resultImage: imageUpload.result, isHost, user, token })
  }

  return { error: imageUpload.error }
}

type ResultPlayer = {
  resultImage: CloudinaryImage
  isHost: boolean
  user: string
  token: string
}

const resultPlayer = async ({
  resultImage,
  user,
  isHost,
  token,
}: ResultPlayer): Promise<tokenStatus> => {
  if (isHost) {
    const cDate = Date.now().toString()
    const room = `ivanrice-guessAi-room-${cDate}`
    //token
    const newToken = await createToken({ inviteCode: room })
    const uriToken = encodeURIComponent(newToken.token)
    //add to presence
    createPresence({ room, image: resultImage.url, user, tags: resultImage.tags })
    return { uriToken, imageUrl: resultImage.url }
  }
  //validar token
  const validToken = (await verifyToken(token)) as { inviteCode: string } | false
  if (validToken === false) return { error: 'Error al validar el token', imageUrl: resultImage.url }
  const isValidToken = validToken.inviteCode.startsWith('ivanrice-guessAi-room-')
  const room = validToken.inviteCode
  //add to presence
  createPresence({ room, image: resultImage.url, user, tags: resultImage.tags })
  return { isValidToken, imageUrl: resultImage.url }
}

type CreatePresence = {
  room: string
  image: string
  user: string
  tags: string[]
}
const createPresence = async ({ room, image, user, tags }: CreatePresence) => {
  const newRoom = supabaseClient.channel(room)
  const newPlayer: UserPresence = {
    user,
    image,
    tags: tags,
  }
  try {
    await newRoom.subscribe(async (status) => {
      if (status !== 'SUBSCRIBED') return
      const presenceTrackStatus = await newRoom.track(newPlayer)
      console.log('preStatus ', { presenceTrackStatus })
    })
  } catch (error) {
    console.error('Error subscribing to room:', error)
  }
}
