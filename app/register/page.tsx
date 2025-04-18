'use client'

import {Button, Form, Input, InputProps} from '@heroui/react'
import InputMask from 'react-input-mask'
import {FormEvent, useEffect, useState} from 'react'
import {useSession} from 'next-auth/react'
import {useRouter} from 'next/navigation'
import {useSetRecoilState} from 'recoil'
import alertState from '@/src/state/alertState'

const emailRegexp = new RegExp(
  /^[a-z0-9](\.?[a-z0-9]){5,}@g(oogle)?mail\.com$/gm,
)

export default function Register() {
  const router = useRouter()
  const {data: session} = useSession()
  const setAlertData = useSetRecoilState(alertState)

  const [email, setEmail] = useState<string>(session?.user.email || undefined)
  const [emailErrors, setEmailErrors] = useState<string[]>([])

  const [phoneNumber, setPhoneNumber] = useState<string>(
    session?.user.phone_number || undefined,
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
      const result = await fetch('/api/getData')

      const data = await result.json()

      router.push('/')
    }
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 gap-4">
      <h1 className="text-5xl font-bold">Регистрация</h1>
      <div className="flex justify-center gap-4 w-full sm:w-1/2 max-h-[50%] flex-wrap">
        <Form className="w-full" onSubmit={handler}>
          <Input
            label="Позывной"
            size="lg"
            defaultValue={session?.user.name || ''}
            name="name"
            isRequired
            errorMessage="Поле обязательно"
          />
          <Input
            label="Фамилия"
            defaultValue={session?.user.last_name || ''}
            size="lg"
            isRequired
            name="last_name"
            errorMessage="Поле обязательно"
          />
          <Input
            label="Имя"
            defaultValue={session?.user.first_name || ''}
            size="lg"
            isRequired
            name="first_name"
            errorMessage="Поле обязательно"
          />
          <Input
            label="Отчество"
            defaultValue={session?.user.middle_name || ''}
            size="lg"
            name="middle_name"
            errorMessage="Поле обязательно"
          />
          <InputMask
            mask="+7 999 999-99-99"
            maskChar="_"
            value={phoneNumber}
            onChange={e => setPhoneNumber(e.target.value)}>
            {(inputProps: InputProps) => (
              <Input
                {...inputProps}
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
          </InputMask>

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
