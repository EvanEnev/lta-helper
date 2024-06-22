import {GlobalStateContext} from '@/src/utils/stateProvider'
import {Day} from '@/src/utils/types'
import {useContext, useState} from 'react'

type SendButtonOptions = {
  globalComment?: string
}

export default function SendButton({globalComment}: SendButtonOptions) {
  const [isLoading, setIsLoading] = useState(false)

  const {worker, selectedDays, telegram} = useContext(GlobalStateContext)

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
