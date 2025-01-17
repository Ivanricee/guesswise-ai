'use client'
import { useAppStore } from '@/store/zustand-store'

import { useSearchParams } from 'next/navigation'
import { getRoomFromToken } from '@/app/actions/token'
import { useEffect, useState } from 'react'
import GameRoom from './GameRoom'

export default function RoomPlayer() {
  const { token, isInlimit } = useAppStore()
  const searchParams = useSearchParams()
  const [room, setRoom] = useState<string | null>(null)
  const inviteToken = searchParams.get('invitation')
  const validToken = token ?? inviteToken
  useEffect(() => {
    const getRoom = async () => {
      try {
        if (validToken) {
          const room = await getRoomFromToken(validToken)
          setRoom(room)
        }
      } catch (error) {
        console.error('Error al obtener la sala:', error)
      }
    }

    getRoom()
  }, [validToken])

  return (
    <section>
      {room && validToken && isInlimit === true && <GameRoom room={room} isHost={!inviteToken} />}
    </section>
  )
}
