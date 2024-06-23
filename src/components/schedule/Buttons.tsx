import {GlobalStateContext} from '@/src/utils/stateProvider'
import {Day} from '@/src/utils/types'
import {useContext} from 'react'

type ButtonsOptions = {
  day: Day
  index: number
}

export default function Buttons({day, index}: ButtonsOptions) {
  const {selectedDays, setSelectedDays} = useContext(GlobalStateContext)

  const selectedDay = selectedDays.find(item => item?.date === day?.date) || day

  const handler = (value: '+' | '-' | '+/-') => {
    let newDays: Day[] = [...selectedDays]
    const oldDay = newDays.find(item => item?.date === day.date)

    const dayIndex = oldDay ? newDays.indexOf(oldDay) : index

    if (oldDay?.value === value) {
      newDays = newDays.filter(item => item?.date !== day?.date)
    } else {
      const newDay = oldDay ? {...oldDay, value} : {...day, value}
      newDays[dayIndex] = newDay
    }

    setSelectedDays(newDays)
  }

  return (
    <div
      className={`w-full sm:w-1/2 max-w-full sm:max-w-1/2 flex justify-between gap-8`}
      key={index}>
      <button
        className={`btn btn-primary flex-1 ${
          selectedDay?.value === '+' ? 'btn-success' : 'opacity-30'
        }`}
        onClick={() => handler('+')}>
        +
      </button>
      <button
        className={`btn btn-primary flex-1 ${
          selectedDay?.value === '-' ? 'btn-error' : 'opacity-30'
        }`}
        onClick={() => handler('-')}>
        -
      </button>
      <button
        className={`btn btn-primary flex-1 ${
          selectedDay?.value === '+/-' ? 'btn-warning' : 'opacity-30'
        }`}
        onClick={() => handler('+/-')}>
        +/-
      </button>
    </div>
  )
}
