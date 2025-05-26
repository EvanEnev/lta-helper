'use client'

import {useCallback, useEffect} from 'react'
import React from 'react'
import Loading from '@/app/loading/page'
import {useRouter} from 'next/navigation'
import {useAtom} from 'jotai'
import {daysAtom, telegramAtom} from '@/src/utils/global/atoms'
import useTelegramLogin from '@/src/hooks/useTelegramLogin'
import supabase from '@/lib/supabase'

const requiredFields = ['email', 'phone_number', 'first_name', 'last_name']

export default function AuthProvider({children}: {children: React.ReactNode}) {
  const router = useRouter()
  const {login, isLoading} = useTelegramLogin()

  const [telegram, setTelegram] = useAtom(telegramAtom)
  const [days, setDays] = useAtom(daysAtom)

  const getWorker = useCallback(async (): Promise<void> => {
    const response = await fetch('/api/getData')

    const data = await response.json()

    if (data?.length) {
      const newDays = data.map((day: any) => ({
        ...day,
        date: day.date,
      }))

      setDays(newDays)
    }
  }, [setDays])

  useEffect(() => {
    const main = async () => {
      const {data: user} = await supabase.auth.getUser()

      let appTelegram = {}

      if (process.env.NODE_ENV === 'development') {
        appTelegram = {}
      } else {
        const telegramObject = (window as any)?.Telegram?.WebApp
        appTelegram = telegramObject.initData ? telegramObject : {}
      }

      console.log(user)
      if (!user && !Object.keys(appTelegram).length) {
        router.push('/login')
        return
      }

      if (user) {
        if (requiredFields.some(key => !user[key])) {
          return router.push('/register')
        }
      }

      if (Object.keys(telegram).length && user) return

      if (appTelegram) {
        try {
          // @ts-ignore
          appTelegram.ready()
          // @ts-ignore
          appTelegram.expand()
        } catch (e) {}

        if (!user) {
          login({
            // @ts-ignore
            credentials: `https://lt.bubenev.su?${appTelegram.initData}`,
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
    }

    main()
  }, [days.length, getWorker, router, setTelegram, telegram, login])

  return <React.Fragment>{isLoading ? <Loading /> : children}</React.Fragment>
}
