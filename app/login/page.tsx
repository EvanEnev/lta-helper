'use client'

import {useEffect} from 'react'
import {LoginButton} from '@telegram-auth/react'
import {signIn, useSession} from 'next-auth/react'
import {useRouter} from 'next/navigation'
import {useSetAtom} from 'jotai'
import {daysAtom} from '@/src/utils/global/atoms'
import useTelegramLogin from '@/src/hooks/useTelegramLogin'

const requiredFields = ['email', 'phone_number', 'first_name', 'last_name']

export default function Register() {
  const {user, login} = useTelegramLogin()
  const router = useRouter()
  const setDays = useSetAtom(daysAtom)

  useEffect(() => {
    console.log(user)
    if (user) {
      if (requiredFields.some(key => !user[key])) {
        return router.push('/register')
      }

      return router.push('/')
    }
  }, [router, user])

  const handler = async (data: any) => {
    login(data).then(async () => {
      const response = await fetch('/api/getData')

      const data = await response.json()

      console.log(data)
      if (data?.length) {
        setDays(data)
      }

      router.push('/')
    })
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
