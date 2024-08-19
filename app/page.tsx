'use client'

import Circle from '@/src/components/schedule/Circle'
import DayWithComments from '@/src/components/schedule/DayWithComments'
import GlobalComment from '@/src/components/schedule/GlobalComment'
import SendButton from '@/src/components/schedule/SendButton'
import daysState from '@/src/state/daysState'
import workerState from '@/src/state/workerState'
import {Day} from '@/src/utils/types'
import {useRecoilValue} from 'recoil'

export default function Home() {
  const worker = useRecoilValue(workerState)
  const days = useRecoilValue(daysState)

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-16">
      <Circle />
      <span className="text-[#ffffff]/[0.03] absolute top-5">
        BY ДИКИЙ БУНКЕР
      </span>
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
