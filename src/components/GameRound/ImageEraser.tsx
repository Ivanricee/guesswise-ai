/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useRef, useState } from 'react'
import { Stage, Layer, Image as KonvaImage } from 'react-konva'
import { Button } from '../ui/button'

interface Props {
  getMask: (imageUrl: File | null) => void
  baseImgUrl: string
}

export default function ImageEraser({ getMask, baseImgUrl }: Props) {
  const [image, setImage] = useState<HTMLImageElement | null>(null)
  const [resetImg, setResetImg] = useState<boolean>(false)
  const layerRef = useRef<any>(null)
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const contextRef = useRef<CanvasRenderingContext2D | null>(null)
  const isDrawingRef = useRef<boolean>(false)
  const lastPositionRef = useRef<{ x: number; y: number } | null>(null)

  const getImageBuffer = () => {
    if (!canvasRef.current || !image) return

    // Crear un canvas temporal del tamaño original
    const tempCanvas = document.createElement('canvas')
    const originalWidth = 1024
    const originalHeight = 1024
    tempCanvas.width = originalWidth
    tempCanvas.height = originalHeight
    const tempContext = tempCanvas.getContext('2d')

    if (tempContext) {
      // Dibujar la imagen escalada
      tempContext.drawImage(image, 0, 0, originalWidth, originalHeight)
      // Aplicar el dibujo del canvas actual sobre el temporal
      tempContext.globalCompositeOperation = 'destination-atop'
      tempContext.drawImage(canvasRef.current, 0, 0, 500, 500, 0, 0, originalWidth, originalHeight)

      // Convertir a blob
      tempCanvas.toBlob((blob) => {
        if (blob) {
          // Convertir el blob en un archivo
          const fileName = 'edited_image.png' // Nombre del archivo
          const file = new File([blob], fileName, { type: 'image/png' })
          /* const imageUrl = URL.createObjectURL(blob)
          console.log('1024???', { imageUrl, blob })*/
          // Enviar el archivo como parámetro a la función getMask
          getMask(file)
        }
      }, 'image/png')
    }
  }

  const handleMouseDown = (event: any) => {
    isDrawingRef.current = true
    const pos = event.target.getStage().getPointerPosition()
    lastPositionRef.current = { x: pos.x, y: pos.y } // Posición inicial
  }

  const handleMouseUp = () => {
    isDrawingRef.current = false
  }

  const handleMouseMove = (event: any) => {
    if (!isDrawingRef.current || !contextRef.current || !image) return

    const pos = event.target.getStage().getPointerPosition()
    contextRef.current.lineWidth = 20
    contextRef.current.lineJoin = 'round'
    contextRef.current.globalCompositeOperation = 'destination-out' // Para borrar

    if (lastPositionRef.current) {
      contextRef.current.beginPath()
      contextRef.current.moveTo(lastPositionRef.current.x, lastPositionRef.current.y)
      contextRef.current.lineTo(pos.x, pos.y)
      contextRef.current.closePath()
      contextRef.current.stroke()
    }

    lastPositionRef.current = pos
    if (layerRef.current) {
      layerRef.current.batchDraw() // Redibuja el layer
    }
  }

  const handleLoadImage = () => setResetImg((state) => !state)

  useEffect(() => {
    getMask(null)
    const img = new Image()
    img.crossOrigin = 'Anonymous'
    img.onload = () => {
      setImage(img)
      // Ajustar el tamaño del canvas al de la imagen (en este caso 500x500)
      const canvas = document.createElement('canvas')
      canvas.width = 500
      canvas.height = 500
      canvasRef.current = canvas
      contextRef.current = canvas.getContext('2d')

      if (contextRef.current) {
        contextRef.current.clearRect(0, 0, canvas.width, canvas.height)
        // Dibujar la imagen escalada para llenar el canvas
        contextRef.current.drawImage(img, 0, 0, canvas.width, canvas.height)
        contextRef.current.strokeStyle = '#0099ee' // Línea azul (se puede cambiar)
        contextRef.current.lineJoin = 'round'
        contextRef.current.lineWidth = 20
      }

      // Verificar si layerRef.current está disponible antes de usarlo
      if (layerRef.current) {
        layerRef.current.batchDraw()
      }
    }
    img.src = baseImgUrl
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [baseImgUrl, resetImg])

  return (
    <div className="flex flex-col items-center justify-center border-2 bg-orange-800/10">
      <div className="w-fit rounded-md border-2 border-orange-600 p-2 text-center">
        <Stage
          width={500}
          height={500}
          onMouseDown={handleMouseDown}
          onMouseUp={handleMouseUp}
          onMouseMove={handleMouseMove}
        >
          <Layer ref={layerRef}>
            {canvasRef.current && (
              <KonvaImage image={canvasRef.current} width={500} height={500} x={0} y={0} />
            )}
          </Layer>
        </Stage>
      </div>
      <div>
        <Button onClick={getImageBuffer} type="button">
          Guardar Imágen
        </Button>
        <Button onClick={handleLoadImage} type="button">
          Reset Imágen
        </Button>
      </div>
    </div>
  )
}
