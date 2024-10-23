import { create } from 'zustand'
export type BGuessWord = {
  wordToGuess: string
  isValidPlayerGuess: boolean | null
  name: string
  imageUrl: string
}
export type RoundSteps = {
  characterGuess: string | null // el caracter a crear  es de halloween
  isValidPlayerGuess: boolean | null // after 2nd round (true or false
  replacedImgUrl: string | null
}
export const RoundStepsInitState = {
  characterGuess: null,
  isValidPlayerGuess: null,
  replacedImgUrl: null,
}
export type Player = {
  date: number
  name: string
  imageUrl: string
  tags: string[]
  isHost: boolean
  isGuessing: boolean
  isCurrent: boolean
  wordToGuess: string | null
  score: number
}
interface State {
  players: Player[] | null
  token: string | null
  gameStarted: boolean
  roundSteps: RoundSteps
  maxCountPlayers: number
  openAiKey: string | null
  isInlimit: boolean | null
}

interface Actions {
  setPlayer: ({ player, token }: { player: Player; token: string | null }) => void
  removePlayer: ({ imageUrl, name }: { imageUrl: string; name: string }) => void
  updatePlayer: ({
    imageUrl,
    name,
    isGuessing,
  }: {
    imageUrl: string
    name: string
    isGuessing: boolean
  }) => void
  updatePlayers: () => void
  updateGuessWordPlayers: ({ imageUrl, name, wordToGuess, isValidPlayerGuess }: BGuessWord) => void
  setGameStarted: (gameStarted: boolean, maxCountPlayers: number) => void
  setOpenAiKey: (openAiKey: string | null) => void
  setMaxCountPlayers: (maxCountPlayers: number) => void
  setIsInlimit: (isInlimit: boolean | null) => void
  setRoundSteps: (roundSteps: RoundSteps) => void
}

export const useAppStore = create<State & Actions>((set) => ({
  players: null,
  token: null,
  gameStarted: false,
  maxCountPlayers: 0,
  openAiKey: null,
  isInlimit: null,
  roundSteps: RoundStepsInitState,
  setRoundSteps: (roundSteps: RoundSteps) => set(() => ({ roundSteps: { ...roundSteps } })),
  setIsInlimit: (isInlimit: boolean | null) => set(() => ({ isInlimit: isInlimit })),
  setPlayer: ({ player, token }: { player: Player; token: string | null }) =>
    set((prevState) => {
      if (prevState.players) {
        const prevPlayers = structuredClone(prevState.players)
        const updatedPlayer = [...prevPlayers, { ...player }]
        updatedPlayer.sort((a, b) => a.date - b.date)
        if (token) return { players: updatedPlayer, token }
        return { players: updatedPlayer }
      }
      return { players: [{ ...player }], token }
    }),
  removePlayer: ({ imageUrl, name }: { imageUrl: string; name: string }) =>
    set((prevState) => {
      if (prevState.players) {
        const updatedPlayers = prevState.players.filter(
          (player) => !(`${player.imageUrl}${player.name}` === `${imageUrl}${name}`)
        )
        return { players: updatedPlayers }
      }
      return { players: [] }
    }),
  updatePlayer: ({
    imageUrl,
    name,
    isGuessing,
  }: {
    imageUrl: string
    name: string
    isGuessing: boolean
  }) =>
    set((prevState) => {
      if (prevState.players) {
        const updatedPlayers = prevState.players.map((player) => {
          if (`${player.imageUrl}${player.name}` === `${imageUrl}${name}`) {
            return { ...player, isGuessing }
          }
          return player
        })
        return { players: updatedPlayers }
      }
      return { players: [] }
    }),
  updatePlayers: () =>
    set((prevState) => {
      const updatedPlayers = prevState.players?.map((player) => ({ ...player, isGuessing: true }))
      return { players: updatedPlayers }
    }),
  updateGuessWordPlayers: ({ imageUrl, name, wordToGuess, isValidPlayerGuess }: BGuessWord) =>
    set((prevState) => {
      if (prevState.players) {
        const updatedPlayers = prevState.players.map((player) => {
          if (`${player.imageUrl}${player.name}` === `${imageUrl}${name}`) {
            if (isValidPlayerGuess === true) {
              return { ...player, wordToGuess, score: player.score + 1 }
            }
            return { ...player, wordToGuess }
          }
          return player
        })
        return { players: updatedPlayers }
      }
      return { players: [] }
    }),
  setGameStarted: (gameStarted: boolean, maxCountPlayers: number) =>
    set(() => ({
      gameStarted,
      maxCountPlayers,
    })),
  setOpenAiKey: (openAiKey: string | null) =>
    set(() => ({
      openAiKey,
    })),
  setMaxCountPlayers: (maxCountPlayers: number) =>
    set(() => ({
      maxCountPlayers,
    })),
}))
