'use client'

import {addToast} from '@heroui/react'
import {
  Button,
  FieldError,
  Form,
  Input,
  Label,
  TextField,
} from '@heroui/react-beta'
import {FormEvent} from 'react'
import {useRouter} from 'next/navigation'
import {LTWorker} from '@/src/utils/types'
import {withMask} from 'use-mask-input'

interface RegisterPageProps {
  worker: LTWorker
}

export default function RegisterPage({worker}: RegisterPageProps) {
  const router = useRouter()

  const handler = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const data = Object.fromEntries(new FormData(e.currentTarget))

    const result = await fetch('/api/register', {
      method: 'POST',
      body: JSON.stringify({data: data}),
    })

    let message = ''

    try {
      const resultData = await result.json()
      if (resultData.message) {
        message = resultData.message
      }
    } catch {}

    if (result.ok) {
      addToast({
        title: 'Успешно!',
        description: message || 'Регистрация завершена',
        timeout: 8000,
        color: 'success',
        shouldShowTimeoutProgress: true,
      })
    } else {
      addToast({
        title: 'Ошибка!',
        description: message || 'Неизвестная ошибка',
        color: 'danger',
      })
    }

    if (result.ok) {
      router.push('/')
    }
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 p-4">
      <h1 className="text-5xl font-bold">Регистрация</h1>
      <div className="flex max-h-[50%] w-full flex-wrap justify-center gap-4 sm:w-1/2">
        <Form className="w-full" onSubmit={handler}>
          <TextField isRequired defaultValue={worker.name || ''}>
            <Label>Позывной</Label>
            <Input name="name" />
            <FieldError>Поле обязательно</FieldError>
          </TextField>
          <TextField isRequired defaultValue={worker.lastName || ''}>
            <Label>Фамилия</Label>
            <Input name="last_name" />
            <FieldError>Поле обязательно</FieldError>
          </TextField>
          <TextField isRequired defaultValue={worker.firstName || ''}>
            <Label>Имя</Label>
            <Input name="first_name" />
            <FieldError>Поле обязательно</FieldError>
          </TextField>
          <TextField defaultValue={worker.middleName || ''}>
            <Label>Отчество</Label>
            <Input name="middle_name" />
          </TextField>
          <TextField
            type="tel"
            isRequired
            defaultValue={worker.phoneNumber || ''}>
            <Label>Номер телефона</Label>
            <Input
              placeholder="+7 ___ ___-__-__"
              ref={withMask('+7 999 999-99-99', {
                inputmode: 'numeric',
                placeholder: '_',
              })}
              name="phone"
            />
            <FieldError>Поле обязательно</FieldError>
          </TextField>
          <TextField type="email" isRequired defaultValue={worker.email || ''}>
            <Label>Google почта</Label>
            <Input name="email" />
            <FieldError>Неверная почта</FieldError>
          </TextField>

          <Button
            className="mt-8 h-16 w-full"
            variant="primary"
            size="lg"
            type="submit">
            Отправить
          </Button>
        </Form>
      </div>
    </main>
  )
}
