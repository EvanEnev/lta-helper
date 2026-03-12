'use client'

import {LoginButton, TelegramAuthData} from '@telegram-auth/react'
import {redirect, useSearchParams} from 'next/navigation'
import {useCallback} from 'react'
import {
  Form,
  Label,
  TextField,
  Input,
  FieldError,
  Button,
} from '@heroui/react-beta'
import {authClient} from '@/lib/auth/authClient'

export default function Register() {
  const params = useSearchParams()

  const login = useCallback(async (telegramData: string | TelegramAuthData) => {
    if (typeof telegramData !== 'string' && !Object.keys(telegramData).length) {
      return
    }

    try {
      await fetch('/api/auth/telegram', {
        method: 'POST',
        body: JSON.stringify({credentials: telegramData, initiator: 'login'}),
      })
    } catch (err) {
      console.error(err)
    }
  }, [])

  const handler = async (data: any) => {
    if (!data) return
    await login(data)
    let path = params.get('redirect') || '/'

    redirect(path)
  }

  const onsubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    const formData = new FormData(e.currentTarget)
    const data: Record<string, string> = {}

    formData.forEach((value, key) => {
      data[key] = value.toString()
    })

    await authClient.signIn.email({
      email: data.email,
      password: data.password,
      rememberMe: true,
      callbackURL: '/',
    })
  }

  // https://oauth.telegram.org/auth?bot_id=7614425121&origin=http://192.168.8.111&return_to=${redirect}
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 p-4">
      <h1 className="text-5xl font-bold">Необходимо войти</h1>
      <div className="flex max-h-[50%] w-full flex-wrap justify-center gap-4">
        <Button
          onPress={async () => {
            const data = await authClient.signIn.social({
              provider: 'google',
            })

            await fetch('/api/test', {
              method: 'POST',
              body: JSON.stringify(data),
            })

            console.debug(data)
          }}>
          Google
        </Button>
        <LoginButton
          botUsername={process.env.NEXT_PUBLIC_BOT_USERNAME || ''}
          onAuthCallback={handler}
        />
        <Form className="flex flex-col gap-4" onSubmit={onsubmit}>
          <TextField isRequired name="email" type="email">
            <Label>Почта</Label>
            <Input placeholder="john@example.com" />
            <FieldError />
          </TextField>

          <TextField isRequired minLength={8} name="password" type="password">
            <Label>Пароль</Label>
            <Input placeholder="Введите пароль" />
            <FieldError />
          </TextField>
          <div className="flex gap-2">
            <Button type="submit">Войти</Button>
            <Button type="reset" variant="secondary">
              Сбросить
            </Button>
          </div>
        </Form>
      </div>
    </main>
  )
}
