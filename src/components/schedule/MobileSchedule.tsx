import {Divider} from '@nextui-org/react'
import DayButton from './DayButton'
import DayInfo from './DayInfo'
import SendButton from './SendButton'
import daysState from '@/src/state/daysState'
import selectedDayState from '@/src/state/selectedDayState'
import {Day} from '@/src/utils/types'
import {useMemo} from 'react'
import {useRecoilValue} from 'recoil'

export default function MobileSchedule() {
  const days = useRecoilValue(daysState)
  const selectedDay = useRecoilValue(selectedDayState)

  const day: Day = useMemo(
    () => days?.find(d => d.date === selectedDay.date) || {date: ''},
    [days, selectedDay],
  )

  return (
    <div className="flex justify-center gap-4 w-full max-h-[50%] flex-wrap">
      {days.length ? (
        days.map((day: Day, index: number) => (
          <DayButton day={day} key={index} />
        ))
      ) : (
        <i className="opacity-50">Дат пока нет..</i>
      )}
      <Divider />
      <DayInfo day={day} />
      <SendButton />
    </div>
  )
}
