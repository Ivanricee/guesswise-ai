import { useEffect, useState } from 'react'
import { RoundPlayer } from './hooks/useStartGame'
import { Button } from './ui/button'
import { useAppStore } from '@/store/zustand-store'
import GameRound from './GameRound'

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
  const [showRoundSteps, setShowRoundSteps] = useState(true)
  const [showComplete, setShowComplete] = useState(false)
  const { roundSteps } = useAppStore()
  //const [roundPlayers, setRoundPlayers] = useState<RoundPlayer[] | null>(null)
  //no mostrar completar si no se han validado las acciones del round
  const { characterGuess, isValidPlayerGuess, replacedImgUrl } = roundSteps

  useEffect(() => {
    if (round && !showRoundSteps) {
      setShowRoundSteps(true)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [round])
  useEffect(() => {
    const isFirstRound = roundNumber === 1
    let areValidSteps = false
    if (isFirstRound) {
      areValidSteps =
        Boolean(characterGuess) && isValidPlayerGuess === null && Boolean(replacedImgUrl)
    } else {
      areValidSteps =
        Boolean(characterGuess) && isValidPlayerGuess !== null && Boolean(replacedImgUrl)
    }
    if (areValidSteps) {
      setShowComplete(true)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roundSteps])
  const onCompleteTurn = () => {
    completeTurn()
    setShowRoundSteps(true)
    setShowComplete(false)
  }
  //round 0 ultimo roundterminado
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
          {showRoundSteps ? (
            <>
              <div>Round {roundNumber}</div>
              <GameRound
                isFirstRound={roundNumber === 1}
                imageUrl={round[0].evaluated.imageUrl}
                toGuessPlayerWord={round[0].evaluated.wordToGuess}
              />
              {showComplete && <Button onClick={onCompleteTurn}>Completar!</Button>}
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
