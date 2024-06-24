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

    const response = await fetch('/api/register', {
      method: 'POST',
      body: JSON.stringify({
        user: {
          initData: telegram.initData,
          initDataUnsafe: telegram.initDataUnsafe,
        },
        name,
      }),
    })

    const data = await response.json()

    setIsLoading(false)

    if (data.worker.name && data.worker.valid) {
      setWorker(data.worker)
      setDays(data?.workingDays || [])
    }

    const newSelectedDays: Day[] = []
    const newDays: Day[] = []
    data?.worker?.workingDays?.forEach(
      (day: {date: string; value?: string; location?: Location}) => {
        newDays.push({date: day.date})
        if (day.location) {
          newSelectedDays.push({
            date: day.date,
            value: day.value,
            location: day.location,
          })
        } else if (day.value) {
          newSelectedDays.push({date: day.date, value: day.value})
        }
      },
    )

    setDays(newDays)
    setSelectedDays(newSelectedDays)
  }

  return (
    <main className="flex min-h-screen flex-col gap-2 items-center justify-center p-16">
      <h1 className="text-3xl font-bold">Регистрация</h1>
      <label className="cursor-pointer label w-1/3 p-0">
        <input
          className={`input input-bordered w-full ${
            name ? '' : 'border-error'
          }`}
          type="text"
          placeholder="Позывной"
          onChange={nameInputHandler}
        />
      </label>
      <button className="btn btn-primary w-1/3" onClick={registerButtonHandler}>
        {isLoading ? <span className="loading loading-spinner" /> : ''}
        Зарегестрироваться
      </button>
    </main>
  )
}
