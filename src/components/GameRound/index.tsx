/* eslint-disable react-hooks/exhaustive-deps */
'use client'
import { useEffect, useState } from 'react'
import GuessWord from './GuessWord'
import ImageReplace from './ImageReplace'
import { useAppStore } from '@/store/zustand-store'
import { Card, CardContent, CardHeader } from '../ui/card'
export type OnGuessWord = {
  guessWord: string
  characterGuess: string
  isValidPlayerGuess: boolean | null
}
type RoundStep1 = {
  characterGuess: string | null
  isValidPlayerGuess: boolean | null
  guessWord: string
}
type RoundStep2 = {
  replacedImgUrl: string | null
}
interface GameRoundProps {
  isFirstRound: boolean
  imageUrl: string
  toGuessPlayerWord: string | null
}
export default function GameRound({ isFirstRound, imageUrl, toGuessPlayerWord }: GameRoundProps) {
  const { setRoundSteps } = useAppStore()
  const [isformStep1, setIsFormStep1] = useState<boolean | null>(null)
  const [isformStep2, setIsFormStep2] = useState<boolean | null>(null)

  const [locRoundStep1, setLocRoundStep1] = useState<RoundStep1>({
    characterGuess: null, // el caracter a crear  es de halloween
    isValidPlayerGuess: null, // after 2nd round (true or false
    guessWord: '',
  })
  const [locRoundStep2, setLocRoundStep2] = useState<RoundStep2>({
    replacedImgUrl: null,
  })

  //broadcast to share word in current player and score
  const onGuessWord = ({ characterGuess, isValidPlayerGuess, guessWord }: OnGuessWord) => {
    //isValidPlayerGuess is null means is first round
    setLocRoundStep1({ characterGuess, isValidPlayerGuess, guessWord })

    //add hint in first round
  }
  const onReplacedImg = ({ replacedImgUrl }: { replacedImgUrl: string }) => {
    setLocRoundStep2({ replacedImgUrl })
  }

  useEffect(() => {
    //broadcast to share word in current player and score and image
    /*broadcastGuessWord({
      wordToGuess,
      isValidPlayerGuess,
      name,
      imageUrl,
    })*/
    const { characterGuess, isValidPlayerGuess } = locRoundStep1
    const { replacedImgUrl } = locRoundStep2

    //validate step 1
    const isValidCharacter = characterGuess && characterGuess.length > 0

    if (isFirstRound) {
      if (isValidCharacter && isValidPlayerGuess === null) setIsFormStep1(true)
    } else {
      if (isValidCharacter && isValidPlayerGuess !== null) setIsFormStep1(true)
    }
    //validate step 2
    if (replacedImgUrl) setIsFormStep2(true)
  }, [locRoundStep1, locRoundStep2])
  useEffect(() => {
    if (isformStep1 && isformStep2) {
      //broadcas todo
      //css final
      const { characterGuess, isValidPlayerGuess } = locRoundStep1
      const { replacedImgUrl } = locRoundStep2
      setRoundSteps({ characterGuess, isValidPlayerGuess, replacedImgUrl })
    }
  }, [isformStep1, isformStep2])
  return (
    <>
      <Card>
        <CardHeader>Round asd</CardHeader>
        <CardContent>
          {!isformStep1 && isformStep2 === null && (
            <GuessWord
              isformStep1={isformStep1}
              onGuessWord={onGuessWord}
              isfirstRound={isFirstRound}
              toGuessPlayerWord={toGuessPlayerWord}
            />
          )}
          {!isformStep2 && isformStep1 && (
            <ImageReplace
              isformStep2={isformStep2}
              characterSelected={locRoundStep1.guessWord}
              charValidation={locRoundStep1.characterGuess || ''}
              onReplacedImg={onReplacedImg}
              imageUrl={imageUrl}
            />
          )}
        </CardContent>
      </Card>
    </>
  )
}
