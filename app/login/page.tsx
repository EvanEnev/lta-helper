'use client'

import {useEffect, useState} from 'react'
import {useSetRecoilState} from 'recoil'
import daysState from '@/src/state/daysState'
import {LoginButton} from '@telegram-auth/react'
import {signIn, useSession} from 'next-auth/react'
import {useRouter} from 'next/navigation'

export default function Register() {
  const session = useSession()
  const router = useRouter()
  const setDays = useSetRecoilState(daysState)

  useEffect(() => {
    if (session.status === 'authenticated') {
      router.push('/')
      return
    }
  }, [session.status])

  const handler = async (data: any) => {
    signIn('telegram-login', {
      data: JSON.stringify(data),
    }).then(async () => {
      const response = await fetch('/api/getData')

      const data = await response.json()

      if (data?.length) {
        setDays(data)
      }

      router.push('/')
    })
  }

  return (
    <main className="flex flex-col items-center justify-center p-4 gap-4">
      <h1 className="text-5xl font-bold">Необходимо войти</h1>
      <div className="flex justify-center gap-4 w-full max-h-[50%] flex-wrap">
        <LoginButton
          botUsername={process.env.NEXT_PUBLIC_BOT_USERNAME || ''}
          onAuthCallback={handler}
        />
      </div>
    </main>
  )
}
