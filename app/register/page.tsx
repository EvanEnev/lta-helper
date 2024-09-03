'use client'

import {Button, Input} from '@nextui-org/react'
import {useState} from 'react'
import {useRecoilValue, useSetRecoilState} from 'recoil'
import telegramState from '@/src/state/telegramState'
import workerState from '@/src/state/workerState'
import daysState from '@/src/state/daysState'

export default function Register() {
  const [name, setName] = useState<string>('')
  const [isLoading, setLoading] = useState<boolean>(false)
  const telegram = useRecoilValue(telegramState)
  const setWorker = useSetRecoilState(workerState)
  const setDays = useSetRecoilState(daysState)

  const handler = async () => {
    setLoading(true)

    const body = {
      name,
      initData: telegram.initData,
    }

    const result = await fetch('/api/register', {
      method: 'POST',
      body: JSON.stringify(body),
    })

    const data = await result.json()

    if (data.worker.name) {
      setWorker(data.worker)
      setDays(data.worker.workingDays || [])
    }

    if (result.ok) {
      setLoading(false)
    }
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 gap-4">
      <h1 className="text-5xl font-bold">Регистрация</h1>
      <div className="flex justify-center gap-4 w-full max-h-[50%] flex-wrap">
        <Input
          label="Позывной"
          size="lg"
          value={name}
          onChange={e => setName(e.target.value)}
        />
        <Button
          className="w-full h-16"
          variant="shadow"
          color="primary"
          size="lg"
          onClick={handler}
          isLoading={isLoading}>
          Зарегистрироваться
        </Button>
      </div>
    </main>
  )
}
