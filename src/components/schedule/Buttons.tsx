import selectedDaysState from '@/src/state/selectedDaysState'
import {Day} from '@/src/utils/types'
import {useEffect, useMemo, useState} from 'react'
import {useRecoilState} from 'recoil'

type ButtonsOptions = {
  day: Day
  index: number
}

export default function Buttons({day, index}: ButtonsOptions) {
  const [selectedDays, setSelectedDays] = useRecoilState(selectedDaysState)

  const [selectedDay, setSelectedDay] = useState(
    selectedDays.find((item: Day) => item?.date === day?.date) || day,
  )

  const handler = (value: '+' | '-' | '+/-') => {
    const updatedDays = [...selectedDays]

    const newDay =
      selectedDay.value === value
        ? {...selectedDay, value: ''}
        : {...selectedDay, value}

    updatedDays[index] = newDay
    setSelectedDay(newDay)

    setSelectedDays(updatedDays)
  }

  return (
    <div
      className={`w-full sm:w-1/2 max-w-full sm:max-w-1/2 flex justify-between gap-8`}
      key={index}>
      <button
        className={`btn btn-primary flex-1 text-2xl ${
          selectedDay?.value === '+' ? 'btn-success-gradient' : 'opacity-30'
        }`}
        onClick={() => handler('+')}>
        +
      </button>
      <button
        className={`btn btn-primary flex-1 text-2xl ${
          selectedDay?.value === '-' ? 'btn-error-gradient' : 'opacity-30'
        }`}
        onClick={() => handler('-')}>
        -
      </button>
      <button
        className={`btn btn-primary flex-1 text-2xl ${
          selectedDay?.value === '+/-' ? 'btn-warning-gradient' : 'opacity-30'
        }`}
        onClick={() => handler('+/-')}>
        +/-
      </button>
    </div>
  )
}
