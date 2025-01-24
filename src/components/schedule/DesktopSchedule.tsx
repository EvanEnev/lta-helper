import {Card, CardBody, CardHeader} from '@nextui-org/react'
import DayInfo from './DayInfo'
import SendButton from './SendButton'
import daysState from '@/src/state/daysState'
import {Day} from '@/src/utils/types'
import {useRecoilValue} from 'recoil'

export default function DesktopSchedule() {
  const days = useRecoilValue(daysState)

  return (
    <div className="flex justify-center gap-4 w-full flex-wrap">
      {days.length ? (
        days.map((day: Day, index: number) => (
          <Card key={index} className="max-w-[23%]">
            <CardHeader className="justify-center font-bold text-2xl">
              {day.date}
            </CardHeader>
            <CardBody>
              <DayInfo day={day} />
            </CardBody>
          </Card>
        ))
      ) : (
        <i className="opacity-50">Дат пока нет..</i>
      )}
      <SendButton />
    </div>
  )
}
