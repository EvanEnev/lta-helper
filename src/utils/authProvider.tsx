'use client'

import {useCallback, useContext, useEffect, useMemo, useRef} from 'react'
import {GlobalStateContext} from './stateProvider'
import {Day, User} from './types'
import Register from '@/app/register/page'
import Home from '@/app/page'
import Loading from '@/app/loading/page'
import React from 'react'

export default function AuthProvider() {
  const {
    telegram,
    setTelegram,
    worker,
    setWorker,
    loading,
    setLoading,
    setSelectedDays,
    setDays,
  } = useContext(GlobalStateContext)

  const hasMounted = useRef(false)

  const getWorker = useCallback(async (user: User) => {
    const response = await fetch('/api/getData', {
      method: 'POST',
      body: JSON.stringify({user}),
    })

    const data = await response.json()

    if (data.name && data.valid) {
      setWorker(data)
      setDays(data?.workingDays || [])
    }

    const newDays: Day[] = []
    data?.workingDays?.forEach(
      (day: {date: string; value?: string; location?: string}) => {
        if (day.location) {
          newDays.push({
            date: day.date,
            value: day.value,
            location: day.location,
          })
        } else if (day.value) {
          newDays.push({date: day.date, value: day.value})
        }
      },
    )

    setSelectedDays(newDays)
    setLoading(false)
  }, [])

  useEffect(() => {
    if (hasMounted.current) return
    hasMounted.current = true

    if (Object.keys(telegram).length) return
    const appTelegram = (window as any)?.Telegram?.WebApp

    if (appTelegram) {
      try {
        // @ts-ignore
        appTelegram.ready()
        // @ts-ignore
        appTelegram.expand()
      } catch (e) {}
      // @ts-ignore
      getWorker(appTelegram)
      setTelegram(appTelegram)
    }
  }, [])

  return (
    <React.Fragment>
      {loading ? (
        <Loading />
      ) : Object.keys(worker).length === 0 ? (
        <Register />
      ) : (
        <Home />
      )}
    </React.Fragment>
  )
}
