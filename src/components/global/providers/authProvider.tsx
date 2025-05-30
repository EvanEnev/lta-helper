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
import {Day} from '@/src/utils/types'

const requiredFields = ['email', 'phone_number', 'first_name', 'last_name']

export default function AuthProvider({children}: {children: React.ReactNode}) {
  const router = useRouter()
  const [worker, setWorker] = useState<any>({})
  const [workingDays, setWorkingDays] = useState<Day[]>([])
  const [isLoading, setLoading] = useState<boolean>(true)
  const path = usePathname()

  const [telegram, setTelegram] = useAtom(telegramAtom)
  const [days, setDays] = useAtom(daysAtom)

  const autoLogin = useCallback(() => {
    console.debug('autologin')

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
          const userRes = await fetch('/api/getData')
          const userData = await userRes.json()

          const {access_token, refresh_token} = await response.json()
          await supabase.auth.setSession({access_token, refresh_token})

          const workingDays = userData.workingDays.map((day: any) => ({
            ...day,
            date: DateTime.fromISO(day.date),
          }))

          setWorker(userData.worker)
          setWorkingDays(workingDays)
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
  }, [router, setTelegram])

  const login = useCallback(async (telegramData: any) => {
    if (typeof telegramData !== 'string' && !Object.keys(telegramData).length) {
      return
    }

    setLoading(true)

    try {
      const response = await fetch('/api/auth/telegram', {
        method: 'POST',
        body: JSON.stringify({credentials: telegramData, initiator: 'login'}),
      })

      console.debug(response)
      if (response.ok) {
        const userRes = await fetch('/api/getData')
        const userData = await userRes.json()

        const {access_token, refresh_token} = await response.json()
        await supabase.auth.setSession({access_token, refresh_token})

        const workingDays = userData.workingDays.map((day: any) => ({
          ...day,
          date: DateTime.fromISO(day.date),
        }))

        setWorker(userData.worker)
        setWorkingDays(workingDays)
      } else {
        console.error('Login failed')
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    supabase.auth.getSession().then(async session => {
      console.debug(session)
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

    if (Object.keys(worker).length) {
      if (requiredFields.some(key => !worker[key])) {
        return router.push('/register')
      } else if (path === '/login') {
        router.push('/')
      }
    }
  }, [path, router, setDays, worker, workingDays])

  return (
    // @ts-ignore
    <AuthContext.Provider value={{worker, workingDays, login, isLoading}}>
      {isLoading ? <Loading /> : children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
