/* eslint-disable @typescript-eslint/no-explicit-any */
import { supabaseClient, UserPresence } from '@/lib/supabase'
import { useAppStore } from '@/store/zustand-store'
import { RealtimeChannel } from '@supabase/supabase-js'
import { useEffect, useRef } from 'react'

interface UsePresence {
  room: string
}
export const usePresence = ({ room }: UsePresence) => {
  const { setPlayer, players } = useAppStore()
  const roomPlayersRef = useRef<RealtimeChannel | null>(null)
  useEffect(() => {
    if (!roomPlayersRef.current && players && players.length > 0) {
      const roomPlayers = supabaseClient.channel(room)
      roomPlayersRef.current = roomPlayers
      roomPlayers
        .on('presence', { event: 'sync' }, () => {
          const state = roomPlayers.presenceState()

          console.log('sync ', { state })
        })
        .on('presence', { event: 'join' }, ({ newPresences }) => {
          console.log('JOIN', { newPresences })

          const { image, tags, user } = newPresences[0]

          const foundPlayer = players.some(
            (player) => `${player.imageUrl}${player.name}` === `${image}${user}`
          )

          if (!foundPlayer) {
            const player = {
              name: user,
              imageUrl: image,
              tags,
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
        .subscribe(async (status) => {
          if (status === 'SUBSCRIBED') {
            const player = players[0]
            const newPlayer: UserPresence = {
              user: player.name,
              image: player.imageUrl,
              tags: player.tags,
            }
            const presenceTrackStatus = await roomPlayers.track(newPlayer)
            console.log('tracked:', presenceTrackStatus)
          } else if (status === 'TIMED_OUT') {
            console.error('Subscription timed out:', room)
          } else if (status === 'CLOSED') {
            console.warn('Subscription closed:', room)
          } else if (status === 'CHANNEL_ERROR') {
            console.error('Channel error while subscribing to room:', room)
          }
        })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [players])

  return { players }
}
