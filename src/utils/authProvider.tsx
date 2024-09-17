'use client'

import {useCallback, useEffect, useRef, useState} from 'react'
import {Comment, Day} from './types'
import Home from '@/app/page'
import React from 'react'
import {useRecoilState, useSetRecoilState} from 'recoil'
import telegramState from '../state/telegramState'
import workerState from '../state/workerState'
import daysState from '../state/daysState'
import Register from '@/app/register/page'
import Loading from '@/app/loading/page'

export default function AuthProvider() {
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

    const newDays: Day[] = []
    data?.workingDays?.forEach(
      (day: {date: string; value?: string; location?: string}) => {
        const comment =
          data?.comments?.find((c: Comment) => c.date === day.date)?.value || ''

        if (day.location) {
          newDays.push({
            date: day.date,
            value: day.value,
            location: day.location,
            comment,
          })
        } else {
          newDays.push({date: day.date, value: day.value, comment})
        }
      },
    )

    setDays(newDays)
    setWorker(data)
  }, [])

  useEffect(() => {
    if (hasMounted.current) return
    hasMounted.current = true

    if (Object.keys(telegram).length) return
    const appTelegram = (window as any)?.Telegram?.WebApp
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
      {isLoading ? (
        <Loading />
      ) : Object.keys(worker).length === 0 ? (
        <Register />
      ) : (
        <Home />
      )}
    </React.Fragment>
  )
}
