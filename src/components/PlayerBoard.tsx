'use client'

import Image from 'next/image'
import { usePresence } from './hooks/usePresence'
import { useSTartGame } from './hooks/useStartGame'
import { Button } from './ui/button'
import { useAppStore } from '@/store/zustand-store'

export default function PlayerBoard({ room }: { room: string }) {
  const { updatePlayer } = useAppStore()
  const { players, completeRoundCurrentPlayer } = usePresence({ room })
  const { startNewRound, currentRound } = useSTartGame()
  const completeRound = () => {
    console.log({ currentRound })
    if (players) {
      const currentPlayer = players.find((player) => player.isCurrent)
      if (currentPlayer) {
        updatePlayer({ imageUrl: currentPlayer?.imageUrl, name: currentPlayer?.name })
        completeRoundCurrentPlayer(currentPlayer)
      }
    }
  }
  return (
    <section>
      <h2>Players</h2>
      <div className="flex justify-center gap-3 bg-orange-600 p-2">
        {players &&
          players.map((player) => {
            return (
              <div
                key={`${player.imageUrl}${player.name}`}
                className="flex flex-col bg-orange-500 p-2 shadow-sm animate-in"
              >
                <h3 className="text-center font-bold uppercase">{player.name}</h3>
                <Image
                  src={player.imageUrl}
                  alt={`player ${player.name}`}
                  width={150}
                  height={150}
                />
                <p>{player.isGuessing ? 'Guessing' : 'Not Guessing'}</p>
              </div>
            )
          })}
      </div>
      <Button onClick={completeRound}>Completar!</Button>
    </section>
  )
}
