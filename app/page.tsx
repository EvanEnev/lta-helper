'use client'

import workerState from '@/src/state/workerState'
import {useRecoilValue} from 'recoil'
import {Button} from '@nextui-org/react'
import Link from 'next/link'

export default function Home() {
  const worker = useRecoilValue(workerState)

  return (
    <main className="flex min-h-screen flex-col items-center justify-start p-4 gap-4">
      <h1 className="text-5xl font-bold">LTArena Helper</h1>
      <p className="text-3xl">Позывной: {worker.name}</p>
      <div className='flex flex-col gap-4'>
      <Button href="/schedule" as={Link} color="primary" size="lg">
        Заполнить график работы
      </Button>
      {worker.isAdmin ? (
        <Button href="/admin" as={Link} color="primary" size="lg">
          Заполнить график персонала
        </Button>
      ) : (
        ''
      )}
        </div>
      </main>
  )
}
