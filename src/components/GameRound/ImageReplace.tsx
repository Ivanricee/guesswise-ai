import ImageReplaceForm from './imageReplaceForm'
import ImageEraser from './ImageEraser'
import { useState } from 'react'

interface Props {
  isformStep2: null | boolean
  characterSelected: string
  charValidation: string
  imageUrl: string
  onReplacedImg: ({ replacedImgUrl }: { replacedImgUrl: string }) => void
}

export default function ImageReplace({
  isformStep2,
  characterSelected,
  charValidation,
  imageUrl,
  onReplacedImg,
}: Props) {
  const [imageMask, setImageMask] = useState<File | null>(null)
  const getMask = (maskImage: File | null) => {
    setImageMask(maskImage)
    //useState image
  }
  const onReplaceImg = ({ replacedImgUrl }: { replacedImgUrl: string }) => {
    onReplacedImg({ replacedImgUrl })
  }

  return (
    <div>
      <div>
        <h2>{characterSelected}</h2>
        <p>{charValidation}</p>
      </div>
      <ImageReplaceForm
        imageMask={imageMask}
        isformStep2={isformStep2}
        onReplaceImg={onReplaceImg}
        playerImageUrl={imageUrl}
      >
        <ImageEraser getMask={getMask} baseImgUrl={imageUrl} />
      </ImageReplaceForm>
    </div>
  )
}
