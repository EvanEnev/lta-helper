import {GlobalStateContext} from '@/src/utils/stateProvider'
import {Day} from '@/src/utils/types'
import {useContext} from 'react'

type CommentOptions = {
  day: Day
}

export default function CommentInput({day}: CommentOptions) {
  const {selectedDays, setSelectedDays} = useContext(GlobalStateContext)

  const selectedDay = selectedDays?.find(
    item =>
      item?.date.toLocaleDateString('ru-RU') ===
      day.date.toLocaleDateString('ru-RU'),
  )

  const handler = (event: {target: {value: any}}) => {
    const text = event.target.value
    const newDays: Day[] = [...selectedDays]
    const oldDay = newDays.find(
      obj =>
        obj?.date.toLocaleDateString('ru-RU') ===
        day.date.toLocaleDateString('ru-RU'),
    )
    if (!oldDay) return

    const newDay = {...oldDay, comment: text}
    newDays[newDays.indexOf(oldDay)] = newDay
    setSelectedDays(newDays)
  }

  if (selectedDay?.location) {
    return (
      <div className="w-full sm:w-1/2 border-[1px] rounded-lg flex justify-left items-center h-12 pl-4">
        <span className="h-fit">{selectedDay.location}</span>
      </div>
    )
  } else {
    return (
      <input
        className="input input-bordered w-full sm:w-1/2"
        placeholder="Комментарий"
        disabled={!selectedDay}
        onChange={handler}
        value={selectedDay?.comment || ''}
      />
    )
  }
}
