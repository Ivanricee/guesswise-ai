/* eslint-disable react-hooks/exhaustive-deps */
import { getRoomFromToken } from '@/app/actions/token'
import { supabaseClient } from '@/lib/supabase'
import { useAppStore } from '@/store/zustand-store'
import { useEffect } from 'react'

export const usePlayerLimit = ({ token }: { token: string | null }) => {
  const { isInlimit, setIsInlimit } = useAppStore()
  //const [isInlimit, setIsInlimit] = useState<null | boolean>(null)
  const maxPlayers = 5
  useEffect(() => {
    const checkPlayers = async () => {
      if (token) {
        const room = (await getRoomFromToken(token)) || ''
        const roomPlayers = supabaseClient.channel(room)
        roomPlayers
          .on('presence', { event: 'sync' }, () => {
            const state = roomPlayers.presenceState()
            const countPlayers = Object.keys(state).length
            if (countPlayers > maxPlayers) {
              setIsInlimit(false)
            } else {
              setIsInlimit(true)
            }
            return roomPlayers.unsubscribe()
          })
          .subscribe()
      } else {
        return setIsInlimit(true)
      }
    }

    checkPlayers()
  }, [])
  return { isInlimit }
}
