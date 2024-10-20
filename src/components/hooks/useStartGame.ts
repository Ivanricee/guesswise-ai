import { Player } from '@/store/zustand-store'
import { useRef, useState } from 'react'

export interface RoundPlayer {
  evaluator: Player
  evaluated: Player
}

function* roundGenerator(players: Player[] | null) {
  if (!players) return
  const countPlayers = players.length - 1
  for (let round = 0; round < countPlayers; round++) {
    //console.log('current round ', { round })
    yield players.map((player, idx) => {
      const playerToEvaluate = () => {
        let nextPlayer = idx + round + 1
        if (nextPlayer > countPlayers) nextPlayer = nextPlayer - countPlayers - 1
        return nextPlayer
      }
      const game: RoundPlayer = {
        evaluator: player,
        evaluated: players[playerToEvaluate()],
      }
      return game
    })
  }
}
interface StartRound {
  generator: Generator<RoundPlayer[]> // Tipo explícito del generador
  onRoundEnd: () => void
}
export const useSTartGame = () => {
  const [currentRound, setCurrentRound] = useState<RoundPlayer[] | null>(null)
  const generator = useRef<Generator<RoundPlayer[]> | null>(null)

  const startRound = ({ generator, onRoundEnd }: StartRound) => {
    //console.log('logRound', { players })

    const resultNext = generator.next()
    const nextValue = resultNext.value || null
    setCurrentRound(nextValue)
    if (!nextValue) {
      console.log('No hay más rondas. El juego ha terminado.')
      onRoundEnd()
      return
    }

    /*const roundTimeout = setTimeout(() => {
      console.log('tiempo agotado')
      proceedToNextRound()
    }, 5000)*/
  }
  //--------------------------

  const startNewRound = (players: Player[]) => {
    if (!generator.current) {
      generator.current = roundGenerator(players)
    }
    startRound({
      generator: generator.current,
      onRoundEnd: () => {
        console.log('El juago ha finalizado')
      },
    })
  }
  return { startNewRound, currentRound: currentRound }
}
