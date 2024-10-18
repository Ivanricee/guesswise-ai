import { create } from 'zustand'

export type Player = {
  date: number
  name: string
  imageUrl: string
  tags: string[]
  isHost: boolean
  isGuessing: boolean
  isCurrent: boolean
}
interface State {
  players: Player[] | null
  token: string | null
}
interface Actions {
  setPlayer: ({ player, token }: { player: Player; token: string | null }) => void
  removePlayer: ({ imageUrl, name }: { imageUrl: string; name: string }) => void
  updatePlayer: ({ imageUrl, name }: { imageUrl: string; name: string }) => void
}

export const useAppStore = create<State & Actions>((set) => ({
  players: null,
  token: null,
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
  updatePlayer: ({ imageUrl, name }: { imageUrl: string; name: string }) =>
    set((prevState) => {
      if (prevState.players) {
        const updatedPlayers = prevState.players.map((player) => {
          if (`${player.imageUrl}${player.name}` === `${imageUrl}${name}`) {
            return { ...player, isGuessing: false }
          }
          return player
        })
        return { players: updatedPlayers }
      }
      return { players: [] }
    }),
}))
