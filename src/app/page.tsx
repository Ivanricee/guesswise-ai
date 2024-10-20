import NewPlayer from '@/components/NewPlayer'
import { Suspense } from 'react'

export default function Home() {
  return (
    <section className="">
      <Suspense>
        <NewPlayer />
      </Suspense>
    </section>
  )
}
