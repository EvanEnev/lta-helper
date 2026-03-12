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
  Separator,
} from '@heroui/react-beta'
import {authClient} from '@/lib/auth/authClient'
import {Icon} from '@iconify/react'
import capitalize from '@/lib/functions/capitalize'

const providers = [
  {name: 'google', icon: 'google-icon'},
  {name: 'apple', icon: 'apple'},
  {name: 'discord', icon: 'discord-icon'},
]

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
      <div className="flex w-fit flex-col flex-wrap justify-center gap-4">
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
            <Button className="w-full" type="submit" variant="secondary">
              Войти
            </Button>
            <Button className="w-full" type="reset" variant="tertiary">
              Сбросить
            </Button>
          </div>
        </Form>
        <div className="flex max-w-full items-center gap-2">
          <Separator className="flex-1" />
          <p>или</p>
          <Separator className="flex-1" />
        </div>
        {providers.map(provider => (
          <Button
            key={provider.name}
            className="w-full"
            variant="tertiary"
            onPress={async () => {
              await authClient.signIn.social({
                provider: provider.name,
              })
            }}>
            <Icon
              icon={`logos:${provider.icon}`}
              className="w-fit p-1"
              width="256"
              height="262"
            />
            Войти с {capitalize(provider.name)}
          </Button>
        ))}
      </div>
    </main>
  )
}
