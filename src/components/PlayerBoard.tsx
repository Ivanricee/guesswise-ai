import { Player } from '@/store/zustand-store'
import Image from 'next/image'
import { RoundPlayer } from './hooks/useStartGame'
import { Button } from './ui/button'

interface PlayerBoardProps {
  players: Player[] | null
  currentRound: RoundPlayer[] | null
  isHost: boolean
  broadcastStartGame: () => void
}

export default function PlayerBoard({
  players,
  currentRound,
  isHost,
  broadcastStartGame,
}: PlayerBoardProps) {
  const onStartGame = async () => {
    await broadcastStartGame()
  }
  return (
    <>
      <h1 className="p-4 text-center text-2xl font-bold uppercase">Jugadores</h1>
      <div className="flex flex-wrap justify-center gap-3 ">
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
        {!currentRound && players && isHost && (
          <div className="flex w-full flex-col items-center justify-center">
            <div>
              {players && players.length === 1 && (
                <h2>
                  ¡Listo para jugar! Puedes empezar solo o esperar a más jugadores (máximo 5).
                </h2>
              )}
              {players && players.length > 1 && (
                <h2>
                  {`¡Hay ${players.length} jugadores! Puedes empezar ahora o esperar hasta 5 jugadores.`}
                </h2>
              )}
              {players && players.length === 5 && (
                <h2>
                  ¡Genial! Ya hay 5 jugadores. ¡Estás listo para iniciar la partida cuando quieras!
                </h2>
              )}
            </div>

            <Button onClick={onStartGame}>Comenzar juego</Button>
          </div>
        )}
      </div>
    </>
  )
}
