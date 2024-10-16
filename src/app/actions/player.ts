'use server'

import { CloudinaryImage, uploadToCloudinary } from '@/lib/cloudinary'
import { testImages } from '@/lib/testImage'
import { DropzoneRootProps } from 'react-dropzone'
import { createToken, verifyToken } from './token'

export type tokenStatus = {
  isValidToken?: boolean | null
  uriToken?: string | null
  imageUrl?: string | null
  error?: string
  room?: string
  tags?: string[]
  areValidTags?: boolean
}
const minTags = 8
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
    return resultPlayer({ resultImage, isHost, user, token, tags: resultImage.tags })
  }

  const imageUpload = await uploadToCloudinary({ imageFile })
  if (imageUpload.result) {
    return resultPlayer({
      resultImage: imageUpload.result,
      isHost,
      user,
      token,
      tags: imageUpload.result.tags,
    })
  }

  return { error: imageUpload.error }
}

type ResultPlayer = {
  resultImage: CloudinaryImage
  isHost: boolean
  user: string
  token: string
  tags: string[]
}

const resultPlayer = async ({
  resultImage,
  //user,
  isHost,
  token,
  tags,
}: ResultPlayer): Promise<tokenStatus> => {
  if (isHost) {
    const cDate = Date.now().toString()
    const room = `ivanrice-guessAi-room-${cDate}`
    //token
    const newToken = await createToken({ inviteCode: room })
    const uriToken = encodeURIComponent(newToken.token)
    const areValidTags = validateMinTags(tags, resultImage.url)
    return { uriToken, imageUrl: resultImage.url, tags, areValidTags }
  }
  //validar token
  const validToken = (await verifyToken(token)) as { inviteCode: string } | false
  if (validToken === false) return { error: 'Error al validar el token', imageUrl: resultImage.url }
  const isValidToken = validToken.inviteCode.startsWith('ivanrice-guessAi-room-')
  const areValidTags = validateMinTags(tags, resultImage.url)
  return { isValidToken, imageUrl: resultImage.url, tags, areValidTags }
}

const validateMinTags = (tags: string[], image: string) => {
  if (tags.length >= minTags) return true
  // delete image from cloudinary by image
  console.log({ image })

  return false
}
