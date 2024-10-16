'use client'

import { copyToClipboard } from '@/lib/utils'
import { Input } from './ui/input'
import { Button } from './ui/button'

export default function ShareToken({ token }: { token: string | null }) {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || ''
  const invitationUrl = `${baseUrl}?invitation=${token}`

  const handleClick = async () => {
    await copyToClipboard(invitationUrl)
  }

  return (
    <section className="flex bg-stone-950/20 ">
      {token && (
        <>
          <Button onClick={handleClick}>Copiar invitación</Button>
          <Input value={invitationUrl} disabled />
        </>
      )}
    </section>
  )
}
