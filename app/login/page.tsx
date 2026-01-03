'use client'

import {LoginButton} from '@telegram-auth/react'
import {useAuth} from '@/src/components/global/providers/authProvider'
import {redirect, useSearchParams} from "next/navigation";

export default function Register() {
  const {login} = useAuth()
  const  params = useSearchParams()

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
