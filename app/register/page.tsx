'use client'

import {Button, Form, Input} from '@nextui-org/react'
import {FormEvent, useState} from 'react'
import {useSetRecoilState} from 'recoil'
import daysState from '@/src/state/daysState'
import {useSession} from 'next-auth/react'

export default function Register() {
  const {data: session} = useSession()
  const [name, setName] = useState<string>(session?.user.name || '')
  const [isLoading, setLoading] = useState<boolean>(false)
  const setDays = useSetRecoilState(daysState)
  const [errors, setErrors] = useState({})

  const handler = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const data = Object.fromEntries(new FormData(e.currentTarget))

    console.log(data)
    ;[
      'name',
      'last_name',
      'middle_name',
      'last_name',
      'phone',
      'email',
    ].forEach(key => {
      if (!data[key]) {
        setErrors(prev => ({...prev, [key]: 'Поле обязательно'}))
      }
    })

    // setLoading(true)

    // const body = {
    //   name,
    // }

    // const result = await fetch('/api/register', {
    //   method: 'POST',
    //   body: JSON.stringify(body),
    // })

    // const data = await result.json()

    // if (data.worker.name) {
    //   setDays(data.worker.workingDays || [])
    // }

    // if (result.ok) {
    //   setLoading(false)
    // }
  }
  console.log(errors)
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 gap-4">
      <h1 className="text-5xl font-bold">Регистрация</h1>
      <div className="flex justify-center gap-4 w-full sm:w-1/2 max-h-[50%] flex-wrap">
        <Form className="w-full" onSubmit={handler} validationErrors={errors}>
          <Input
            label="Позывной"
            size="lg"
            defaultValue={session?.user.name || ''}
            name="name"
            isRequired
          />
          <Input label="Фамилия" size="lg" isRequired name="last_name" />
          <Input label="Имя" size="lg" isRequired name="first_name" />
          <Input label="Отчество" size="lg" name="middle_name" />
          <Input label="Номер телефона" size="lg" isRequired name="phone" />
          <Input
            label="Google-почта"
            size="lg"
            isRequired
            type="email"
            name="email"
          />
          <Button
            className="w-full h-16"
            variant="shadow"
            color="primary"
            size="lg"
            type="submit"
            isLoading={isLoading}>
            Отправить
          </Button>
        </Form>
      </div>
    </main>
  )
}
