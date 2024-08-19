import selectedDaysState from '@/src/state/selectedDaysState'
import {Day} from '@/src/utils/types'
import {useRecoilState} from 'recoil'

type CommentOptions = {
  day: Day
}

export default function CommentInput({day}: CommentOptions) {
  const [selectedDays, setSelectedDays] = useRecoilState(selectedDaysState)

  const selectedDay = selectedDays?.find((item: Day) => item?.date === day.date)

  const handler = (event: {target: {value: any}}) => {
    const text = event.target.value
    const newDays: Day[] = [...selectedDays]
    const oldDay = newDays.find(obj => obj?.date === day.date)
    if (!oldDay) return

    const newDay = {...oldDay, comment: text}
    newDays[newDays.indexOf(oldDay)] = newDay
    setSelectedDays(newDays)
  }

  if (selectedDay?.location?.name) {
    const {location} = selectedDay
    return (
      <div
        style={{background: location.color}}
        className={`w-full sm:w-1/2 rounded-lg flex justify-left items-center h-12 pl-4`}>
        <span className="h-fit text-lg">{location.name}</span>
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
