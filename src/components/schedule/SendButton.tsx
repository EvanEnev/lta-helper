'use client'

import {GlobalStateContext} from '@/src/utils/stateProvider'
import {Day} from '@/src/utils/types'
import {useContext, useState} from 'react'

export default function SendButton() {
  const [isLoading, setIsLoading] = useState(false)

  const {worker, selectedDays, telegram, globalComment} =
    useContext(GlobalStateContext)

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
    <button className="btn btn-primary" onClick={sendButtonHandler}>
      {isLoading ? <span className="loading loading-spinner" /> : ''}
      Отправить
    </button>
  )
}
