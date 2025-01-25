'use client'

import {useCallback, useEffect, useRef, useState} from 'react'
import {Comment, Day} from './types'
import React from 'react'
import {useRecoilState, useSetRecoilState} from 'recoil'
import telegramState from '../state/telegramState'
import workerState from '../state/workerState'
import daysState from '../state/daysState'
import Register from '@/app/register/page'
import Loading from '@/app/loading/page'

export default function AuthProvider({children}: {children: React.ReactNode}) {
  const [isLoading, setLoading] = useState<boolean>(true)
  const [telegram, setTelegram] = useRecoilState(telegramState)
  const [worker, setWorker] = useRecoilState(workerState)
  const setDays = useSetRecoilState(daysState)

  const hasMounted = useRef(false)

  const getWorkerData = async (telegram: any) => {
    const response = await fetch('/api/getWorkerData', {
      method: 'POST',
      body: JSON.stringify({initData: telegram.initData}),
    })

    const data = await response.json()

    if (data.name) {
      setWorker(data)
    }

    setLoading(false)
  }

  const getWorker = useCallback(async (telegram: any) => {
    const response = await fetch('/api/getData', {
      method: 'POST',
      body: JSON.stringify({initData: telegram.initData}),
    })

    const data = await response.json()

    if (data?.workingDays?.length) {
      setDays(data.workingDays)
    }

    setWorker(data)
  }, [])

  const testTelegramUser = {
    initData:
      'query_id=AAFDzyovAAAAAEPPKi-SagWQ&user=%7B%22id%22%3A791334723%2C%22first_name%22%3A%22%D0%98%D0%B2%D0%B0%D0%BD%22%2C%22last_name%22%3A%22%D0%91%D1%83%D0%B1%D0%B5%D0%BD%D1%91%D0%B2%22%2C%22username%22%3A%22EvanEnev%22%2C%22language_code%22%3A%22en%22%2C%22is_premium%22%3Atrue%2C%22allows_write_to_pm%22%3Atrue%7D&auth_date=1726580048&hash=b7361efd067b8a12dd9b112606c0a7d9cfe0cf68a765c75f6c9414bde57f782b',
  }

  useEffect(() => {
    if (hasMounted.current) return
    hasMounted.current = true

    if (Object.keys(telegram).length) return

    let appTelegram

    if (process.env.NODE_ENV === 'development') {
      appTelegram = testTelegramUser
    } else {
      appTelegram = (window as any)?.Telegram?.WebApp
    }

    if (appTelegram) {
      try {
        appTelegram.ready()
        appTelegram.expand()
      } catch (e) {}
      getWorkerData(appTelegram)
      getWorker(appTelegram)
      setTelegram(appTelegram)
    }
  }, [])

  return (
    <React.Fragment>
      {isLoading ? <Loading /> : !worker?.name ? <Register /> : children}
    </React.Fragment>
  )
}
