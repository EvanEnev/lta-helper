import {GlobalStateContext} from '@/src/utils/stateProvider'
import {Day as DayType} from '@/src/utils/types'
import {Dispatch, SetStateAction, useCallback, useContext} from 'react'

interface DayProps {
  day: DayType
  index: number
  selectedDays: DayType[]
  setSelectedDays: Dispatch<SetStateAction<DayType[]>>
}

export default function Day({day, index}: DayProps) {
  const {setSelectedDays} = useContext(GlobalStateContext)

  const handleDayClick = useCallback(() => {
    setSelectedDays((prevSelectedDays: DayType[]) => {
      const isSelected = prevSelectedDays.includes(day)
      if (isSelected) {
        return prevSelectedDays.filter(
          selectedDay => selectedDay.date !== day.date,
        )
      } else {
        return [...prevSelectedDays, day]
      }
    })
  }, [day])

  return (
    <div
      className={`w-full sm:w-1/2`}
      onClick={handleDayClick}
      key={index}></div>
  )
}
