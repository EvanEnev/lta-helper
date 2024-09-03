'use client'

import daysState from '@/src/state/daysState'
import workerState from '@/src/state/workerState'
import {Day} from '@/src/utils/types'
import {useRecoilValue} from 'recoil'
import DayButton from '@/src/components/schedule/DayButton'
import {Divider} from '@nextui-org/react'
import DayInfo from '@/src/components/schedule/DayInfo'
import SendButton from '@/src/components/schedule/SendButton'

export default function Home() {
  const worker = useRecoilValue(workerState)
  const days = useRecoilValue(daysState)

  return (
    <main className="flex min-h-screen flex-col items-center justify-start p-4 gap-4">
      <h1 className="text-5xl font-bold">График</h1>
      <p className="text-3xl">Позывной: {worker.name}</p>
      <div className="flex justify-center gap-4 w-full max-h-[50%] flex-wrap">
        {days.map((day: Day, index: number) => (
          <DayButton day={day} key={index} />
        ))}
        <Divider />
        <DayInfo />
        <SendButton />
      </div>
    </main>
  )
}
