import {GlobalStateContext} from '@/src/utils/stateProvider'
import {Day} from '@/src/utils/types'
import {useContext, useState} from 'react'

type SendButtonOptions = {
  isNextWeek: boolean
  globalComment?: string
}

export default function SendButton({
  isNextWeek,
  globalComment,
}: SendButtonOptions) {
  const [isLoading, setIsLoading] = useState(false)

  const {worker, selectedDays} = useContext(GlobalStateContext)

  const sendButtonHandler = async () => {
    if (isLoading) return
    setIsLoading(true)

    const days = selectedDays.map((day: Day) => ({
      ...day,
      date: day.date.toLocaleString('ru-RU', {
        month: 'numeric',
        day: 'numeric',
      }),
    }))

    const body = {
      selectedDays: days,
      isNextWeek,
      worker,
      globalComment,
    }

    const result = await (
      await fetch('/api/send', {
        method: 'POST',
        body: JSON.stringify(body),
      })
    ).json()

    if (result?.error) {
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
