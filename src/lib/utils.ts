import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const copyToClipboard = async (text: string) => {
  try {
    await navigator.clipboard.writeText(text)
    console.log('Texto copiado al portapapeles', text)
  } catch (error) {
    console.log('Fallo al copiar el texto al portapapeles', error)
  }
}
