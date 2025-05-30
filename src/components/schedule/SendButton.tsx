import {Button} from '@heroui/react'
import {useState} from 'react'
import useIsMobile from '@/src/hooks/useIsMobile'
import {Plain} from 'solar-icon-set'
import {Day} from '@/src/utils/types'
import {selectedDayAtom, telegramAtom} from '@/src/utils/global/atoms'
import {useAtom, useAtomValue} from 'jotai'
import {useAuth} from '@/src/components/global/providers/authProvider'

export default function SendButton({
  className = '',
  days,
}: {
  className?: string
  days: Day[]
}) {
  const isMobile = useIsMobile()
  const telegram = useAtomValue(telegramAtom)
  const [isLoading, setLoading] = useState<boolean>(false)
  const [selectedDay, setSelectedDay] = useAtom(selectedDayAtom)
  const {worker} = useAuth()
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
      setLoading(false)
      telegram.close().catch(() => {})
    }
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
