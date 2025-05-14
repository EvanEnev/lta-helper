'use client'

import {useCallback, useEffect, useRef} from 'react'
import React from 'react'
import {signIn, useSession} from 'next-auth/react'
import Loading from '@/app/loading/page'
import {useRouter} from 'next/navigation'
import convertTZ from '@/lib/convertTZ'
import {useAtom} from 'jotai'
import {daysAtom, telegramAtom} from '@/src/utils/global/atoms'

const requiredFields = ['email', 'phone_number', 'first_name', 'last_name']

export default function AuthProvider({children}: {children: React.ReactNode}) {
  const router = useRouter()
  const session = useSession()
  const [telegram, setTelegram] = useAtom(telegramAtom)
  const [days, setDays] = useAtom(daysAtom)

  const currentStatus = useRef('')

  const getWorker = useCallback(async () => {
    const response = await fetch('/api/getData')

    const data = await response.json()

    if (data?.length) {
      const newDays = data.map((day: any) => ({
        ...day,
        date: convertTZ(new Date(day.date), 'Europe/Moscow'),
      }))

      setDays(newDays)
    }
  }, [])

  useEffect(() => {
    if (session?.status === currentStatus.current) return

    currentStatus.current = session?.status

    let appTelegram = {}

    if (process.env.NODE_ENV === 'development') {
      appTelegram = {}
    } else {
      const telegramObject = (window as any)?.Telegram?.WebApp
      appTelegram = telegramObject.initData ? telegramObject : {}
    }

    if (
      !session?.data?.user &&
      !Object.keys(appTelegram).length &&
      session?.status !== 'loading'
    ) {
      router.push('/login')
      return
    }

    if (session?.status === 'authenticated') {
      if (requiredFields.some(key => !session?.data?.user[key])) {
        return router.push('/register')
      }
    }

    if (Object.keys(telegram).length && session?.data?.user) return

    if (appTelegram) {
      try {
        // @ts-ignore
        appTelegram.ready()
        // @ts-ignore
        appTelegram.expand()
      } catch (e) {}

      if (session?.status === 'unauthenticated') {
        signIn('telegram-login', {
          // @ts-ignore
          data: `https://lt.bubenev.su?${appTelegram.initData}`,
        }).then(() => {
          getWorker()
          setTelegram(appTelegram)
        })
      } else {
        getWorker()
        setTelegram(appTelegram)
      }
    } else if (!days.length) {
      getWorker()
    }
  }, [session.status])

  return (
    <React.Fragment>
      {session?.status === 'loading' ? <Loading /> : children}
    </React.Fragment>
  )
}
