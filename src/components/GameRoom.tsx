'use client'

import { usePresence } from './hooks/usePresence'
import { useSTartGame } from './hooks/useStartGame'
import { Button } from './ui/button'
import { useAppStore } from '@/store/zustand-store'
import Round from './Round'
import { useEffect, useState } from 'react'
import PlayerBoard from './PlayerBoard'

export default function GameRoom({ room, isHost }: { room: string; isHost: boolean }) {
  const { updatePlayer, gameStarted, maxCountPlayers } = useAppStore()
  const { startNewRound, currentRound } = useSTartGame()
  const { players, completeTurnCurrentPlayer, completeRound, broadcastStartGame } = usePresence({
    room,
    startNewRound,
  })

  const [countRound, setCountRound] = useState(0)
  const [endRound, setEndRound] = useState(false)
  const completeTurn = () => {
    if (players) {
      const currentPlayer = players.find((player) => player.isCurrent)
      if (currentPlayer) {
        updatePlayer({
          imageUrl: currentPlayer?.imageUrl,
          name: currentPlayer?.name,
          isGuessing: false,
        })
        completeTurnCurrentPlayer(currentPlayer)
      }
    }
  }
  useEffect(() => {
    if (players && !endRound) {
      const isGuessing = players.some((player) => {
        return player.isGuessing === true
      })
      if (!isGuessing) {
        setEndRound(true)
        setCountRound((state) => state - 1)
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [players])
  useEffect(() => {
    setCountRound(maxCountPlayers - 1)
  }, [maxCountPlayers])
  const onEndRound = async ({ endGame }: { endGame?: boolean }) => {
    await completeRound({ endGame })
    setEndRound(false)
  }

  const showNextRoundButton = endRound && players

  return (
    <section className="bg-orange-600 p-2">
      {!gameStarted ? (
        <PlayerBoard
          broadcastStartGame={broadcastStartGame}
          isHost={isHost}
          currentRound={currentRound}
          players={players}
        />
      ) : (
        <>
          <Round
            round={currentRound}
            completeTurn={completeTurn}
            countRound={countRound}
            roundNumber={maxCountPlayers - countRound}
            isHost={isHost}
          />
        </>
      )}
      {showNextRoundButton && (
        <>
          {countRound === 0 ? (
            <>
              {isHost && (
                <Button onClick={() => onEndRound({ endGame: true })}>Ver Resultados</Button>
              )}{' '}
            </>
          ) : (
            <>{isHost && <Button onClick={() => onEndRound({})}>Siguiente Round</Button>} </>
          )}
        </>
      )}
    </section>
  )
}
