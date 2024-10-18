/* eslint-disable @typescript-eslint/no-explicit-any */
import { supabaseClient, UserPresence } from '@/lib/supabase'
import { Player, useAppStore } from '@/store/zustand-store'
import { RealtimeChannel } from '@supabase/supabase-js'
import { useEffect, useRef } from 'react'

interface UsePresence {
  room: string
}
export const usePresence = ({ room }: UsePresence) => {
  const { setPlayer, players, updatePlayer } = useAppStore()

  const playersRef = useRef<Player[] | null>([])
  const roomPlayersRef = useRef<RealtimeChannel | null>(null)
  const countPlayers = useRef<number>(0)
  const maxPlayers = 2
  //const playerUpdate = useRef<any>(null)

  useEffect(() => {
    playersRef.current = players
    if (!roomPlayersRef.current && players && players.length > 0) {
      const roomPlayers = roomPlayersRef.current ?? supabaseClient.channel(room)
      roomPlayersRef.current = roomPlayers
      roomPlayers
        .on('presence', { event: 'join' }, ({ newPresences }) => {
          console.log('JOIN', { newPresences })

          const { image, tags, user, date } = newPresences[0]
          if (playersRef.current) {
            const foundPlayer = playersRef.current.some((player) => {
              console.log(
                `player image:${player.imageUrl} name:${player.name} | new presence image: ${image} user:${user}`
              )

              return `${player.imageUrl}${player.name}` === `${image}${user}`
            })
            console.log({ image, tags, user, date, foundPlayer, playersRef: playersRef.current })

            if (!foundPlayer) {
              const player = {
                date,
                name: user,
                imageUrl: image,
                tags,
                isHost: false,
                isGuessing: true,
                isCurrent: false,
              }
              setPlayer({ player, token: null })
            }
          }
        })
        .on('presence', { event: 'leave' }, ({ key, leftPresences }) => {
          console.log('leave', key, leftPresences)
          const { image, user } = leftPresences[0]
          if (countPlayers.current === maxPlayers) {
            //playerUpdate.current = leftPresences[0]
            //update new
            updatePlayer({ imageUrl: image, name: user })
          }
          //removePlayer({ imageUrl: image, name: user })
          //remove prev
        })
        .on('presence', { event: 'sync' }, () => {
          const state = roomPlayers.presenceState()
          const count = Object.keys(state).length
          if (countPlayers.current === maxPlayers) {
          }
          countPlayers.current = count
          console.log('sync ', { state })
        })
        .subscribe(async (status) => {
          if (status === 'SUBSCRIBED' && playersRef.current) {
            const player = playersRef.current[0]
            const newPlayer: UserPresence = {
              user: player.name,
              image: player.imageUrl,
              tags: player.tags,
              date: Date.now(),
              isGuessing: true,
            }
            const presenceTrackStatus = await roomPlayers.track(newPlayer)
            console.log('tracked: primero ', presenceTrackStatus)
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
  const completeRoundCurrentPlayer = async (playerUpdated: Player) => {
    if (playerUpdated && roomPlayersRef.current) {
      const playerToUpdate: UserPresence = {
        user: playerUpdated?.name,
        image: playerUpdated?.imageUrl,
        tags: playerUpdated?.tags,
        date: playerUpdated?.date,
        isGuessing: false,
      }
      const presenceTrackStatus = await roomPlayersRef.current.track(playerToUpdate)
      console.log('guessin to false ', { presenceTrackStatus, playerToUpdate })
    }
  }
  return { players, completeRoundCurrentPlayer }
}
