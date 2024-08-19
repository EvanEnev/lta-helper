'use client'

import Send from '@/public/icons/Send'
import globalCommentState from '@/src/state/globalCommentState'
import selectedDaysState from '@/src/state/selectedDaysState'
import telegramState from '@/src/state/telegramState'
import workerState from '@/src/state/workerState'
import {Day} from '@/src/utils/types'
import {useState} from 'react'
import {useRecoilValue} from 'recoil'

export default function SendButton() {
  const [isLoading, setIsLoading] = useState(false)

  const worker = useRecoilValue(workerState)
  const selectedDays = useRecoilValue(selectedDaysState)
  const telegram = useRecoilValue(telegramState)
  const globalComment = useRecoilValue(globalCommentState)

  const sendButtonHandler = async () => {
    if (isLoading) return
    setIsLoading(true)

    const days = selectedDays.map((day: Day) => ({
      ...day,
      date: day.date,
    }))

    const body = {
      selectedDays: days,
      worker,
      telegram_id: telegram.initDataUnsafe.user.id,
      globalComment,
    }

    const result = await fetch('/api/send', {
      method: 'POST',
      body: JSON.stringify(body),
    })

    if (result.ok) {
      telegram.close()
    }

    setIsLoading(false)
  }

  return (
    <button
      className="btn btn-accent shadow-glow sm:shadow-none hover:shadow-glow text-xl"
      onClick={sendButtonHandler}>
      {isLoading ? (
        <span className="loading loading-spinner" />
      ) : (
        <Send strokeWidth={2} />
      )}
      Отправить
    </button>
  )
}
