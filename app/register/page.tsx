'use client'

import {useContext, useState} from 'react'
import {GlobalStateContext} from '@/src/utils/stateProvider'
import {Day, Location} from '@/src/utils/types'

export default function Register() {
  const [name, setName] = useState<string>('')
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const {telegram, setWorker, setDays, setSelectedDays} =
    useContext(GlobalStateContext)

  const nameInputHandler = (event: {target: {value: any}}) => {
    const text = event.target.value
    setName(text)
  }
  const registerButtonHandler = async () => {
    if (isLoading || !name) return
    setIsLoading(true)
    const user = telegram.initDataUnsafe.user

    const response = await fetch('/api/register', {
      method: 'POST',
      body: JSON.stringify({user, name}),
    })

    const data = await response.json()

    setIsLoading(false)

    if (data.name && data.valid) {
      setWorker(data)
      setDays(data?.workingDays || [])
    }

    const newDays: Day[] = []
    data?.workingDays?.forEach(
      (day: {date: string; value?: string; location?: Location}) => {
        if (day.location) {
          newDays.push({
            date: day.date,
            value: day.value,
            location: day.location,
          })
        } else if (day.value) {
          newDays.push({date: day.date, value: day.value})
        }
      },
    )

    setSelectedDays(newDays)
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-16">
      <h1 className="text-3xl font-bold">Регистрация</h1>
      <label className="cursor-pointer label">
        <input
          className={`input input-bordered ${name ? '' : 'border-error'}`}
          type="text"
          placeholder="Позывной"
          onChange={nameInputHandler}
        />
      </label>
      <button className="btn btn-primary" onClick={registerButtonHandler}>
        {isLoading ? <span className="loading loading-spinner" /> : ''}
        Зарегестрироваться
      </button>
    </main>
  )
}
