import { useEffect, useState } from 'react'
import { RoundPlayer } from './hooks/useStartGame'
import { Button } from './ui/button'

interface RoundProps {
  round: RoundPlayer[] | null
  completeTurn: () => void
  countRound: number
  roundNumber: number
  isHost: boolean
}
export default function Round({
  round,
  completeTurn,
  countRound,
  roundNumber,
  isHost,
}: RoundProps) {
  const [showComplete, setShowComplete] = useState(true)
  //const [roundPlayers, setRoundPlayers] = useState<RoundPlayer[] | null>(null)
  //no mostrar completar si no se han validado las acciones del round

  useEffect(() => {
    if (round && !showComplete) {
      setShowComplete(true)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [round])
  const onCompleteTurn = () => {
    completeTurn()
    setShowComplete(false)
  }

  if (countRound === 0)
    return (
      <>
        {isHost ? (
          <div>
            {
              <>
                <p>¡Todos han terminado!</p>
                <p>
                  {'El round ha finalizado. Haz clic en "Ver resultados" para ver cómo te fue.'}
                </p>
              </>
            }
          </div>
        ) : (
          <div>Has completado tu último round. ¡Bien hecho! Ahora, espera los resultados.</div>
        )}
      </>
    )
  return (
    <>
      {round ? (
        <>
          {showComplete ? (
            <>
              <div>Round {roundNumber}</div>
              <Button onClick={onCompleteTurn}>Completar!</Button>
            </>
          ) : (
            <>
              {isHost ? (
                <>
                  <p>¡Bien hecho! Espera a que todos terminen.</p>
                  <p>{'Da clic en "Siguiente round" o "Ver resultados" cuando estén listos.'}</p>
                </>
              ) : (
                <>
                  <p>¡Bien hecho! Espera a los demás.</p>
                  <p>El round terminará cuando todos hayan completado su turno.</p>
                </>
              )}
            </>
          )}
        </>
      ) : (
        <div>Game over</div>
      )}
    </>
  )
}
