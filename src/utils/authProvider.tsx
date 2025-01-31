'use client'

import {useCallback, useEffect, useRef, useState} from 'react'
import React from 'react'
import {useRecoilState, useSetRecoilState} from 'recoil'
import telegramState from '../state/telegramState'
import daysState from '../state/daysState'
import {signIn, useSession} from 'next-auth/react'
import Loading from '@/app/loading/page'
import {useRouter} from 'next/navigation'

export default function AuthProvider({children}: {children: React.ReactNode}) {
  const router = useRouter()
  const session = useSession()
  const [telegram, setTelegram] = useRecoilState(telegramState)
  const [days, setDays] = useRecoilState(daysState)

  const currentStatus = useRef('')

  const getWorker = useCallback(async () => {
    const response = await fetch('/api/getData')

    const data = await response.json()

    if (data?.length) {
      setDays(data)
    }
  }, [])

  const testTelegramUser = {
    initData:
      'query_id=AAFDzyovAAAAAEPPKi8_oqAH&user=%7B%22id%22%3A791334723%2C%22first_name%22%3A%22%D0%98%D0%B2%D0%B0%D0%BD%22%2C%22last_name%22%3A%22%D0%91%D1%83%D0%B1%D0%B5%D0%BD%D1%91%D0%B2%22%2C%22username%22%3A%22EvanEnev%22%2C%22language_code%22%3A%22en%22%2C%22is_premium%22%3Atrue%2C%22allows_write_to_pm%22%3Atrue%2C%22photo_url%22%3A%22https%3A%5C%2F%5C%2Ft.me%5C%2Fi%5C%2Fuserpic%5C%2F320%5C%2FNXcC6y0ADOo2YcGDM8CsZ86kXpwARYXPDW2KI7o6ppQ.svg%22%7D&auth_date=1738182946&signature=EmNhbpnkOQ0SqtVuSkunCUBreJTyUxNQ8f2A92XJI3P9M6MZm-GOnIbkjCsqqtJJsr9PXaHv0qqWEQ8LFz4vBg&hash=94e366517234791fe39c3333f1b4cb845018b43466f78abb5e461b81b8ecde70',
  }

  useEffect(() => {
    if (session?.status === currentStatus.current) return

    currentStatus.current = session?.status

    let appTelegram

    if (process.env.NODE_ENV === 'development') {
      appTelegram = testTelegramUser
    } else {
      appTelegram = (window as any)?.Telegram?.WebApp
    }

    if (!session?.data?.user && !appTelegram && session?.status !== 'loading') {
      router.push('/login')
      return
    }

    console.log(session)

    if (Object.keys(telegram).length && session?.data?.user) return

    if (appTelegram) {
      try {
        appTelegram.ready()
        appTelegram.expand()
      } catch (e) {}

      if (session?.status === 'unauthenticated') {
        signIn('telegram-login', {
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
