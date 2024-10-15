/* eslint-disable @typescript-eslint/no-explicit-any */
import { v2 as cloudinary } from 'cloudinary'
import { DropzoneRootProps } from 'react-dropzone'

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

export { cloudinary }

interface Upload {
  imageFile: DropzoneRootProps
}
export type CloudinaryImage = {
  tags: string[]
  width: number
  height: number
  url: string
  asset_id: string
}
export type UploadResponse = {
  success: boolean
  result?: CloudinaryImage
  error?: any
}

export const uploadToCloudinary = async ({ imageFile }: Upload): Promise<UploadResponse> => {
  try {
    const fileBuffer = await imageFile.arrayBuffer()
    const mimeType = imageFile.type
    const encoding = 'base64'
    const encodeData = Buffer.from(fileBuffer).toString('base64')
    const fileUri = `data:${mimeType};${encoding},${encodeData}`

    const uploadResult = await cloudinary.uploader.upload(fileUri, {
      invalidate: true,
      resource_type: 'auto',
      filename_override: imageFile.name,
      folder: 'Frontend/guesswise/players/local',
      use_filename: true,
      //detection: 'human-anatomy',
    })

    const cloudinaryImage: CloudinaryImage = {
      tags: [],
      width: uploadResult.width,
      height: uploadResult.height,
      url: uploadResult.url,
      asset_id: uploadResult.asset_id,
    }
    if (uploadResult.info) {
      const tagsDetected = uploadResult.info.detection.object_detection.data['human-anatomy'].tags
      cloudinaryImage.tags = Object.keys(tagsDetected)
    }
    return { success: true, result: cloudinaryImage }
  } catch (error) {
    console.log(error)
    return { success: false, error }
  }
}
