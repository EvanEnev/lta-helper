'use client'

import DayWithComments from '@/src/components/schedule/DayWithComments'
import GlobalComment from '@/src/components/schedule/GlobalComment'
import SendButton from '@/src/components/schedule/SendButton'
import {GlobalStateContext} from '@/src/utils/stateProvider'
import {Day} from '@/src/utils/types'
import {useContext} from 'react'

export default function Home() {
  const {worker, days} = useContext(GlobalStateContext)

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-16">
      <h1 className="text-3xl font-bold">Расписание</h1>
      <p className="text-2xl">Позывной: {worker.name}</p>
      <div className="flex flex-col gap-4 w-full sm:w-3/4">
        {days.map((day: Day, index: number) => (
          <DayWithComments key={index} day={day} index={index} />
        ))}
        <GlobalComment />
        <SendButton />
      </div>
    </main>
  )
}
