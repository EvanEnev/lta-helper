import daysState from '@/src/state/daysState'
import telegramState from '@/src/state/telegramState'
import {Button} from '@nextui-org/react'
import {useState} from 'react'
import {useRecoilValue, useSetRecoilState} from 'recoil'
import selectedDayState from '@/src/state/selectedDayState'
import workerState from '@/src/state/workerState'

export default function SendButton() {
  const days = useRecoilValue(daysState)
  const telegram = useRecoilValue(telegramState)
  const [isLoading, setLoading] = useState<boolean>(false)
  const setSelectedDay = useSetRecoilState(selectedDayState)
  const worker = useRecoilValue(workerState)

  const handler = async () => {
    setLoading(true)

    const invalidDay = days.find(
      day =>
        ((worker.type === 'worker' && day.value === '-') ||
          day.value === '+/-') &&
        !day.comment,
    )

    if (invalidDay) {
      setLoading(false)
      setSelectedDay({...invalidDay, invalidComment: true})
      return
    }

    const body = {
      selectedDays: days,
      initData: telegram.initData,
    }

    const result = await fetch('/api/send', {
      method: 'POST',
      body: JSON.stringify(body),
    })

    if (result.ok) {
      setLoading(false)
      telegram.close().catch(() => {})
    }
  }

  return (
    <Button
      onClick={handler}
      isLoading={isLoading}
      size="lg"
      color="primary"
      variant="shadow"
      className="w-full h-16">
      Отправить
    </Button>
  )
}
