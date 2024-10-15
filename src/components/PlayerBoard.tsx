'use client'

import Image from 'next/image'
import { usePresence } from './hooks/usePresence'

export default function PlayerBoard({ room }: { room: string }) {
  const { players } = usePresence({ room })

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
              </div>
            )
          })}
      </div>
    </section>
  )
}
