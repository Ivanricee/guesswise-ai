/* eslint-disable react-hooks/exhaustive-deps */
import { supabaseClient } from '@/lib/supabase'
import { useAppStore } from '@/store/zustand-store'
import { RealtimeChannel } from '@supabase/supabase-js'
import { useEffect } from 'react'

interface UsePresence {
  room: string
}
export const usePresence = ({ room }: UsePresence) => {
  const { setPlayer, players } = useAppStore()

  useEffect(() => {
    let roomPlayers: RealtimeChannel
    if (players && players?.length > 0) {
      roomPlayers = supabaseClient.channel(room)
      roomPlayers
        .on('presence', { event: 'sync' }, () => {
          const newState = roomPlayers.presenceState()
          console.log('sync', newState)
        })
        .on('presence', { event: 'join' }, ({ newPresences }) => {
          //key
          const { image, /*tags,*/ user } = newPresences[0]
          const foundPlayer = players.some(
            (player) => `${player.imageUrl}${player.name}` === `${image}${user}`
          )

          if (!foundPlayer) {
            const player = {
              name: user,
              imageUrl: image,
              isHost: false,
              isGuessing: false,
              isCurrent: false,
            }
            setPlayer({ player, token: null })
          }
        })
        .on('presence', { event: 'leave' }, ({ key, leftPresences }) => {
          console.log('leave', key, leftPresences)
        })
        .subscribe()
    }
    return () => {
      if (players && players?.length > 0) {
        roomPlayers.unsubscribe()
      }
    }
  }, [players])
  return { players }
}
