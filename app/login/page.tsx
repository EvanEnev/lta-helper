'use client'

import {LoginButton, TelegramAuthData} from '@telegram-auth/react'
import {redirect, useSearchParams} from 'next/navigation'
import {useCallback} from 'react'

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

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 p-4">
      <h1 className="text-5xl font-bold">Необходимо войти</h1>
      <div className="flex max-h-[50%] w-full flex-wrap justify-center gap-4">
        <LoginButton
          botUsername={process.env.NEXT_PUBLIC_BOT_USERNAME || ''}
          onAuthCallback={handler}
        />
      </div>
    </main>
  )
}
