import NewPlayer from '@/components/NewPlayer'
import RoomPlayer from '@/components/RoomPlayer'

export default function Home() {
  return (
    <main className="">
      <section>
        <h2>Instructions</h2>
      </section>
      <section>
        <h2>Register</h2>
        {
          //imagen
          //nombre
          //token
        }
        <NewPlayer />
        <RoomPlayer />
      </section>
    </main>
  )
}
