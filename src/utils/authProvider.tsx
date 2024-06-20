'use client'

import {redirect} from 'next/navigation'
import {useContext, useEffect} from 'react'
import StateProvider, {GlobalStateContext} from './stateProvider'
import {Day, User} from './types'
import Register from '@/app/register/page'
import Home from '@/app/page'
import Loading from '@/app/loading/page'
import getDatesInRange from './getDatesInRange'

export default function AuthProvider() {
  const {
    telegram,
    setTelegram,
    setUser,
    worker,
    setWorker,
    loading,
    setLoading,
    setSelectedDays,
  } = useContext(GlobalStateContext)

  const getWorker = async (user: User) => {
    const response = await fetch('/api/getData', {
      method: 'POST',
      body: JSON.stringify({user}),
    })

    const data = await response.json()

    if (data.name) {
      setWorker(data)
    }

    if (data.valid) {
      setUser(user)
    }

    const newDays: Day[] = []
    data?.workingDays?.forEach(
      (day: {date: string; value?: string; location?: string}) => {
        const [dayNumber, month] = day.date?.split('.').map(Number)
        const currentYear = new Date().getFullYear()

        const date = new Date(currentYear, month - 1, dayNumber)

        if (day.location) {
          newDays.push({
            date,
            value: day.value,
            location: day.location,
          })
        } else if (day.value) {
          newDays.push({date, value: day.value})
        }
      },
    )

    setSelectedDays(newDays)

    setLoading(false)
  }

  useEffect(() => {
    if (Object.keys(telegram).length) return
    const appTelegram = (window as any)?.Telegram?.WebApp

    if (appTelegram) {
      appTelegram.ready()
      appTelegram.expand()
      getWorker(appTelegram)
      setTelegram(appTelegram)
    }
  }, [])

  if (loading) return <Loading />

  return Object.keys(worker)?.length === 0 ? <Register /> : <Home />
}
