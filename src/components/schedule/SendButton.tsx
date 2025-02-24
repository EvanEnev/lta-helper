import daysState from '@/src/state/daysState'
import telegramState from '@/src/state/telegramState'
import {Button} from "@heroui/react"
import {useState} from 'react'
import {useRecoilState, useRecoilValue} from 'recoil'
import selectedDayState from '@/src/state/selectedDayState'
import useIsMobile from '@/src/hooks/useIsMobile'
import {Plain} from 'solar-icon-set'
import {useSession} from 'next-auth/react'
import {Day} from '@/src/utils/types'

export default function SendButton({
  className = '',
  days,
}: {
  className?: string
  days: Day[]
}) {
  const isMobile = useIsMobile()
  const telegram = useRecoilValue(telegramState)
  const [isLoading, setLoading] = useState<boolean>(false)
  const [selectedDay, setSelectedDay] = useRecoilState(selectedDayState)
  const {data: session} = useSession()
  const handler = async () => {
    setLoading(true)

    const invalidDay = days.find(
      day =>
        ((session?.user.rank &&
          session?.user.rank.toLowerCase() !== 'актёр' &&
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
      isDisabled={selectedDay.date ? false : isMobile ? true : false}
      onPress={handler}
      isLoading={isLoading}
      size="lg"
      color="primary"
      variant="shadow"
      endContent={<Plain color={'#ffffff'} size={24} />}
      className={`w-full text-2xl  h-16 ${className}`}>
      Отправить
    </Button>
  )
}
