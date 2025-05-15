'use client'

import {useEffect} from 'react'
import {LoginButton} from '@telegram-auth/react'
import {signIn, useSession} from 'next-auth/react'
import {useRouter} from 'next/navigation'
import {useSetAtom} from 'jotai'
import {daysAtom} from '@/src/utils/global/atoms'

const requiredFields = ['email', 'phone_number', 'first_name', 'last_name']

export default function Register() {
  const session = useSession()
  const router = useRouter()
  const setDays = useSetAtom(daysAtom)

  useEffect(() => {
    if (session.status === 'authenticated') {
      if (session?.data?.user) {
        if (requiredFields.some(key => !session?.data?.user[key])) {
          return router.push('/register')
        }
      }
      return router.push('/')
    }
  }, [router, session?.data?.user, session.status])

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
    <main className="flex min-h-screen flex-col items-center justify-center p-4 gap-4">
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
