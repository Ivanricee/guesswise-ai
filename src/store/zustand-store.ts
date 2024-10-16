import { create } from 'zustand'

export type Player = {
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
}

export const useAppStore = create<State & Actions>((set) => ({
  players: null,
  token: null,
  setPlayer: ({ player, token }: { player: Player; token: string | null }) =>
    set((prevState) => {
      if (prevState.players) {
        const prevPlayers = structuredClone(prevState.players)
        if (token) return { players: [...prevPlayers, { ...player }], token }
        return { players: [...prevPlayers, { ...player }] }
      }
      return { players: [{ ...player }], token }
    }),
}))
