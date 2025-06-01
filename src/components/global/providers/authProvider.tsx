'use client'

import {useCallback, useContext, useEffect, useState} from 'react'
import React from 'react'
import Loading from '@/app/loading/page'
import {usePathname, useRouter} from 'next/navigation'
import {useAtom} from 'jotai'
import {daysAtom, telegramAtom} from '@/src/utils/global/atoms'
import AuthContext from '@/src/components/global/contexts/AuthContext'
import supabase from '@/lib/supabase'
import {DateTime} from 'luxon'
import {Day, LTWorker} from '@/src/utils/types'
import {TelegramAuthData} from '@telegram-auth/react'

const requiredFields = ['email', 'phone_number', 'first_name', 'last_name']

export default function AuthProvider({children}: {children: React.ReactNode}) {
  const router = useRouter()
  const [worker, setWorker] = useState<LTWorker>({
    name: '',
    id: 0,
    permissionLevel: 0,
    permissions: [],
    telegramId: 0,
    rank: '',
  })
  const [workingDays, setWorkingDays] = useState<Day[]>([])
  const [isLoading, setLoading] = useState<boolean>(true)
  const path = usePathname()

  const [telegram, setTelegram] = useAtom(telegramAtom)
  const [days, setDays] = useAtom(daysAtom)

  const getData = useCallback(async () => {
    const userRes = await fetch('/api/getData')
    const userData = await userRes.json()

    const workingDays = userData.workingDays.map((day: any) => ({
      ...day,
      date: DateTime.fromISO(day.date),
    }))

    setWorker(userData.worker)
    setWorkingDays(workingDays)
  }, [])

  const autoLogin = useCallback(() => {
    let appTelegram: any = {}

    if (process.env.NODE_ENV === 'development') {
      appTelegram = {}
    } else {
      const telegramObject = (window as any)?.Telegram?.WebApp
      appTelegram = telegramObject.initData ? telegramObject : {}
    }

    if (!appTelegram.initData) {
      router.push('/login')
      setLoading(false)
      return
    }

    setTelegram(appTelegram)

    try {
      fetch('/api/auth/telegram', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({
          credentials: `https://lt.bubenev.su?${appTelegram.initData}`,
          initiator: 'auto',
        }),
      }).then(async response => {
        if (response.ok) {
          const {access_token, refresh_token} = await response.json()
          await supabase.auth.setSession({access_token, refresh_token})

          await getData()
          setLoading(false)
        } else {
          console.error('Login failed')
          setLoading(false)
        }
      })
    } catch (err) {
      console.error(err)
      setLoading(false)
    }
  }, [getData, router, setTelegram])

  const login = useCallback(
    async (telegramData: string | TelegramAuthData) => {
      if (
        typeof telegramData !== 'string' &&
        !Object.keys(telegramData).length
      ) {
        return
      }

      setLoading(true)

      try {
        const response = await fetch('/api/auth/telegram', {
          method: 'POST',
          body: JSON.stringify({credentials: telegramData, initiator: 'login'}),
        })

        if (response.ok) {
          const {access_token, refresh_token} = await response.json()
          await supabase.auth.setSession({access_token, refresh_token})

          await getData()
          setLoading(false)
        } else {
          console.error('Login failed')
          setLoading(false)
        }
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    },
    [getData],
  )

  useEffect(() => {
    supabase.auth.getSession().then(async session => {
      if (session.data.session?.user) {
        const response = await fetch('/api/getData')

        if (response.ok) {
          console.debug('session login')
          const userData = await response.json()

          const workingDays = userData.workingDays.map((day: any) => ({
            ...day,
            date: DateTime.fromISO(day.date),
          }))

          setWorker(userData.worker)
          setWorkingDays(workingDays)
          setLoading(false)
        } else {
          console.error('Autologin failed')
        }
      } else {
        autoLogin()
      }
    })
  }, [autoLogin])

  useEffect(() => {
    if (workingDays?.length) {
      setDays(workingDays)
    }

    console.log({worker})
    if (worker.name) {
      if (requiredFields.some(key => !(worker as any)[key])) {
        return router.push('/register')
      } else if (path === '/login') {
        router.push('/')
      }
    }
  }, [path, router, setDays, worker, workingDays])

  return (
    <AuthContext.Provider value={{worker, workingDays, login, isLoading}}>
      {isLoading ? <Loading /> : children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
