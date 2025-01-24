import daysState from '@/src/state/daysState'
import telegramState from '@/src/state/telegramState'
import {Button} from '@nextui-org/react'
import {useState} from 'react'
import {useRecoilState, useRecoilValue} from 'recoil'
import selectedDayState from '@/src/state/selectedDayState'
import workerState from '@/src/state/workerState'
import useIsMobile from '@/src/hooks/useIsMobile'

export default function SendButton({className = ''}: {className?: string}) {
  const isMobile = useIsMobile()
  const days = useRecoilValue(daysState)
  const telegram = useRecoilValue(telegramState)
  const [isLoading, setLoading] = useState<boolean>(false)
  const [selectedDay, setSelectedDay] = useRecoilState(selectedDayState)
  const worker = useRecoilValue(workerState)

  const handler = async () => {
    setLoading(true)

    const invalidDay = days.find(
      day =>
        ((worker.type === 'worker' && day.value === '-') ||
          day.value === '+/-') &&
        !day.comment?.trim()?.length,
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
      isDisabled={selectedDay.date ? false : isMobile ? true : false}
      onPress={handler}
      isLoading={isLoading}
      size="lg"
      color="primary"
      variant="shadow"
      className={`w-full h-16 ${className}`}>
      Отправить
    </Button>
  )
}
