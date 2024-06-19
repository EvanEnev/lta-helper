'use client'

import DayWithComments from '@/src/components/schedule/DayWithComments'
import SendButton from '@/src/components/schedule/SendButton'
import useDateRange from '@/src/hooks/useDateRange'
import {GlobalStateContext} from '@/src/utils/stateProvider'
import {Day} from '@/src/utils/types'
import {useContext, useState} from 'react'

export default function Home() {
  const [nextWeek, setNextWeek] = useState<boolean>(false)
  const [globalComment, setGlobalComment] = useState<string>()
  const {worker, selectedDays} = useContext(GlobalStateContext)

  const {days} = useDateRange(nextWeek)

  const nextWeekChangeHandler = (event: {
    target: {checked: boolean | ((prevState: boolean) => boolean)}
  }) => setNextWeek(event.target.checked)

  const globalCommentHandler = (event: {target: {value: any}}) => {
    const text = event.target.value
    setGlobalComment(text)
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-16">
      <h1 className="text-3xl font-bold">Расписание</h1>
      <p className="text-2xl">Позывной: {worker.name}</p>
      <label className="cursor-pointer label">
        <span className="mr-4">Следующая неделя</span>
        <input
          className="toggle"
          type="checkbox"
          onChange={nextWeekChangeHandler}
        />
      </label>
      <div className="flex flex-col gap-4 w-full sm:w-3/4">
        {days.map((day: Day, index: number) => (
          <DayWithComments key={index} day={day} index={index} />
        ))}
        <input
          type="text"
          placeholder="Глобальный комменатрий"
          className="input input-bordered"
          value={globalComment}
          onChange={globalCommentHandler}
        />
        <SendButton isNextWeek={nextWeek} globalComment={globalComment} />
      </div>
    </main>
  )
}
