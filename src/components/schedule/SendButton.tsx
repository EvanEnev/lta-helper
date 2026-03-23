import {toast, Button} from '@heroui/react'
import {useState} from 'react'
import useIsMobile from '@/src/hooks/useIsMobile'
import {Day, LTWorker} from '@/src/utils/types'
import {selectedDayAtom} from '@/src/utils/global/atoms'
import {useAtom} from 'jotai'
import {Icon} from '@iconify/react'
import fetchHandler from '@/src/utils/global/fetchHandler'

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
      toast('Ошибка!', {
        description: 'Необходимо указать причину/комментарий',
        variant: 'warning',
      })
      return
    }

    const body = {
      selectedDays: days,
    }

    await fetchHandler({
      url: '/api/send',
      method: 'POST',
      body: body,
    })

    setLoading(false)
  }

  return (
    <Button
      isDisabled={selectedDay.date ? false : isMobile}
      onPress={handler}
      isPending={isLoading}
      slot="icon"
      size="lg"
      className={`h-16 w-full text-2xl ${className}`}>
      <Icon
        icon="solar:plain-linear"
        width="24"
        height="24"
        style={{color: '#fff'}}
      />
      Отправить
    </Button>
  )
}
