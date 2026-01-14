import {addToast, Button} from '@heroui/react'
import {useState} from 'react'
import useIsMobile from '@/src/hooks/useIsMobile'
import {Plain} from 'solar-icon-set'
import {Day, LTWorker} from '@/src/utils/types'
import {selectedDayAtom} from '@/src/utils/global/atoms'
import {useAtom} from 'jotai'

export default function SendButton({
    worker,
  className = '',
  days,
}: {
    worker: LTWorker
  className?: string
  days: Day[]
}) {
  const isMobile = useIsMobile()
  const [isLoading, setLoading] = useState<boolean>(false)
  const [selectedDay, setSelectedDay] = useAtom(selectedDayAtom)
  const handler = async () => {
    setLoading(true)

    const invalidDay = days.find(
      day =>
        ((worker.rank &&
          worker.rank.toLowerCase() !== 'актёр' &&
          day.value === '-') ||
          day.value === '+/-') &&
        !day.comment?.trim()?.length,
    )

    if (invalidDay) {
      setLoading(false)
      setSelectedDay({...invalidDay, invalidComment: true})
      addToast({
        title: 'Ошибка!',
        description: 'Необходимо указать причину/комментарий',
        color: 'warning',
      })
      return
    }

    const body = {
      selectedDays: days,
    }

    const result = await fetch('/api/send', {
      method: 'POST',
      body: JSON.stringify(body),
    })

    if (result.ok) {
      addToast({
        title: 'Успешно!',
        color: 'success',
        description: 'Данные отправлены',
        timeout: 8000,
        shouldShowTimeoutProgress: true,
      })
    } else {
      let message = 'Неизвестная ошибка'

      try {
        const data = await result.json()
        if (data?.message) {
          message = data.message
        }
      } catch {}

      addToast({
        title: 'Ошибка!',
        description: message,
        color: 'danger',
      })
    }

    setLoading(false)
  }

  return (
    <Button
      isDisabled={selectedDay.date ? false : isMobile}
      onPress={handler}
      isLoading={isLoading}
      size="lg"
      color="primary"
      variant="shadow"
      endContent={<Plain color={'#ffffff'} size={24} />}
      className={`h-16 w-full text-2xl ${className}`}>
      Отправить
    </Button>
  )
}
