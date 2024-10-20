/* eslint-disable @typescript-eslint/no-explicit-any */
import { supabaseClient, UserPresence } from '@/lib/supabase'
import { Player, useAppStore } from '@/store/zustand-store'
import { RealtimeChannel } from '@supabase/supabase-js'
import { useEffect, useRef } from 'react'

interface UsePresence {
  room: string
  startNewRound: (players: Player[]) => void
}
export const usePresence = ({ room, startNewRound }: UsePresence) => {
  const {
    setPlayer,
    players,
    updatePlayer,
    updatePlayers,
    setGameStarted,
    gameStarted,
    setMaxCountPlayers,
    setIsInlimit,
  } = useAppStore()

  const playersRef = useRef<Player[] | null>([])
  const roomPlayersRef = useRef<RealtimeChannel | null>(null)
  const countPlayers = useRef<number>(0)
  const gameStartedRef = useRef<boolean>(false)
  const maxPlayers = 5
  //const playerUpdate = useRef<any>(null)

  useEffect(() => {
    playersRef.current = players
    gameStartedRef.current = gameStarted
    if (!roomPlayersRef.current && players && players.length > 0) {
      const roomPlayers =
        roomPlayersRef.current ??
        supabaseClient.channel(room, { config: { broadcast: { ack: true } } })
      roomPlayersRef.current = roomPlayers
      roomPlayers
        .on('presence', { event: 'join' }, ({ newPresences }) => {
          //console.log('JOIN', { newPresences })

          const { image, tags, user, date } = newPresences[0]
          if (playersRef.current) {
            const foundPlayer = playersRef.current.some((player) => {
              return `${player.imageUrl}${player.name}` === `${image}${user}`
            })
            //console.log({ image, tags, user, date, foundPlayer, playersRef: playersRef.current })

            if (!foundPlayer) {
              const player: Player = {
                date,
                name: user,
                imageUrl: image,
                tags,
                isHost: false,
                isGuessing: true,
                isCurrent: false,
                wordToGuess: '',
                score: 0,
              }
              setPlayer({ player, token: null })
            }
          }
        })
        .on('presence', { event: 'leave' }, ({ key, leftPresences }) => {
          console.log('leave', key, leftPresences)
          const { image, user } = leftPresences[0]
          //on leave and start game -> update is guessing to false
          if (gameStartedRef) updatePlayer({ imageUrl: image, name: user, isGuessing: false })
        })
        .on('presence', { event: 'sync' }, () => {
          const state = roomPlayers.presenceState()
          countPlayers.current = Object.keys(state).length
        })
        .on('broadcast', { event: 'start-game' }, (payload) => {
          if (playersRef.current) {
            const maxPlayers = countPlayers.current
            setGameStarted(true, maxPlayers)
            startNewRound(playersRef.current)
          }
          console.log('start game', payload)
        })
        .on('broadcast', { event: 'complete-round' }, (result) => {
          console.log('is end game', result.payload.endGame)

          if (playersRef.current) {
            const cPlayer = playersRef.current.find((player) => player.isCurrent)
            startNewRound(playersRef.current)
            if (cPlayer)
              updatePlayer({ imageUrl: cPlayer.imageUrl, name: cPlayer.name, isGuessing: true })
            if (result.payload.endGame) setMaxCountPlayers(0)
          }
        })
        .subscribe(async (status) => {
          if (status === 'SUBSCRIBED' && playersRef.current) {
            if (countPlayers.current > maxPlayers) {
              setIsInlimit(false)
            } else {
              setIsInlimit(true)
            }
            const player = playersRef.current[0]
            const newPlayer: UserPresence = {
              user: player.name,
              image: player.imageUrl,
              tags: player.tags,
              date: Date.now(),
              isGuessing: true,
            }
            /*const presenceTrackStatus =*/ await roomPlayers.track(newPlayer)
            //console.log('tracked: primero ', presenceTrackStatus)
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
  const completeTurnCurrentPlayer = async (playerUpdated: Player) => {
    if (playerUpdated && roomPlayersRef.current) {
      const playerToUpdate: UserPresence = {
        user: playerUpdated?.name,
        image: playerUpdated?.imageUrl,
        tags: playerUpdated?.tags,
        date: playerUpdated?.date,
        isGuessing: false,
      }
      await roomPlayersRef.current.track(playerToUpdate)
      //console.log('guessin to false ', { presenceTrackStatus, playerToUpdate })
    }
  }
  const completeRound = async ({ endGame }: { endGame?: boolean }) => {
    if (roomPlayersRef.current) {
      const broadcastResp = await roomPlayersRef.current.send({
        type: 'broadcast',
        event: 'complete-round',
        payload: { endGame: endGame },
      })
      if (broadcastResp === 'ok') {
        if (endGame) setMaxCountPlayers(0)
        updatePlayers()
      }
      if (playersRef.current) {
        startNewRound(playersRef.current)
      }
      return broadcastResp === 'ok'
    }
  }
  const broadcastStartGame = async () => {
    if (roomPlayersRef.current) {
      const broadcastResp = await roomPlayersRef.current.send({
        type: 'broadcast',
        event: 'start-game',
        payload: { message: 'isRound1' },
      })
      const maxPlayers = countPlayers.current
      if (broadcastResp === 'ok') setGameStarted(true, maxPlayers)
      if (playersRef.current) {
        console.log('Solo en host')

        startNewRound(playersRef.current)
      }
      //console.log('serverResponse', serverResponse)
    }
  }
  return { players, completeTurnCurrentPlayer, completeRound, broadcastStartGame }
}
