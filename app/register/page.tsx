'use client'

import {Button, Form, Input} from '@heroui/react'
import MaskedInput from 'react-text-mask'
import {FormEvent, useEffect, useState} from 'react'
import {useRouter} from 'next/navigation'
import {useSetAtom} from 'jotai'
import {alertAtom} from '@/src/utils/global/atoms'
import {useAuth} from '@/src/components/global/providers/authProvider'

export default function Register() {
  const router = useRouter()
  const {worker} = useAuth()
  const setAlertData = useSetAtom(alertAtom)

  const [email, setEmail] = useState<string>(worker?.email || '')
  const [emailErrors, setEmailErrors] = useState<string[]>([])

  const [phoneNumber, setPhoneNumber] = useState<string>(
    worker?.phone_number || '',
  )
  const [phoneNumberError, setPhoneNumberError] = useState<string>()

  const [isLoading, setLoading] = useState<boolean>(false)

  useEffect(() => {
    // console.log(emailErrors, email !== undefined && !emailRegexp.test(email))

    const errors: string[] = []

    if (email === '') {
      errors.push('Поле обязательно')
    }

    // if (email && !emailRegexp.test(email)) {
    //   errors.push('Это не почта Google')
    // }

    setEmailErrors(errors)

    if (phoneNumber !== undefined && phoneNumber.includes('_')) {
      setPhoneNumberError('Поле обязательно')
    } else {
      setPhoneNumberError('')
    }
  }, [email, phoneNumber])

  const handler = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const data = Object.fromEntries(new FormData(e.currentTarget))

    setLoading(true)

    const result = await fetch('/api/register', {
      method: 'POST',
      body: JSON.stringify({data: data}),
    })

    setLoading(false)

    const resultData = await result.json()

    if (resultData.message) {
      if (!result.ok) {
        setAlertData({
          title: 'Ошибка',
          message: resultData.message,
          color: 'danger',
        })
      } else {
        setAlertData({
          title: 'Успешно',
          message: resultData.message,
          color: 'success',
        })
      }
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
          <Input
            label="Позывной"
            size="lg"
            defaultValue={worker.name || ''}
            name="name"
            isRequired
            errorMessage="Поле обязательно"
          />
          <Input
            label="Фамилия"
            defaultValue={worker.last_name || ''}
            size="lg"
            isRequired
            name="last_name"
            errorMessage="Поле обязательно"
          />
          <Input
            label="Имя"
            defaultValue={worker.first_name || ''}
            size="lg"
            isRequired
            name="first_name"
            errorMessage="Поле обязательно"
          />
          <Input
            label="Отчество"
            defaultValue={worker.middle_name || ''}
            size="lg"
            name="middle_name"
            errorMessage="Поле обязательно"
          />
          <MaskedInput
            mask={[
              '+7',
              '(',
              /[1-9]/,
              /\d/,
              /\d/,
              ')',
              ' ',
              /\d/,
              /\d/,
              /\d/,
              '-',
              /\d/,
              /\d/,
              /\d/,
              /\d/,
            ]}
            value={phoneNumber}
            onChange={e => setPhoneNumber(e.target.value)}
            render={(ref: any, props) => (
              <Input
                ref={ref}
                {...props}
                label="Номер телефона"
                size="lg"
                isRequired
                isInvalid={!!phoneNumberError}
                name="phone"
                type="tel"
                value={phoneNumber}
                onValueChange={setPhoneNumber}
                errorMessage={() => <span>{phoneNumberError}</span>}
              />
            )}
          />

          <Input
            label="Google-почта"
            size="lg"
            isRequired
            isInvalid={emailErrors.length > 0}
            type="email"
            name="email"
            value={email}
            onValueChange={setEmail}
            errorMessage={() =>
              emailErrors.map((error, index) => {
                return <p key={index}>{error}</p>
              })
            }
          />
          <Button
            className="h-16 w-full"
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
