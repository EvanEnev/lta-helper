import {Day as DayType} from '@/src/utils/types'
import Buttons from './Buttons'
import CommentInput from './CommentInput'

interface DayWithCommentsProps {
  day: DayType
  index: number
}

const DayWithComments: React.FC<DayWithCommentsProps> = ({day, index}) => {
  return (
    <div className="gap-4 w-full" key={index}>
      <p>
        {day.date.toLocaleDateString('ru-RU', {
          day: 'numeric',
          weekday: 'long',
          month: 'long',
        })}
      </p>
      <div className="flex gap-4 w-full flex-col sm:flex-row">
        <Buttons day={day} index={index} />
        <CommentInput day={day} />
      </div>
    </div>
  )
}

export default DayWithComments
