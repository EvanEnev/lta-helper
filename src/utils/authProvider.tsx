'use client'

import {useCallback, useContext, useEffect, useMemo, useRef} from 'react'
import {GlobalStateContext} from './stateProvider'
import {Day, User, Location} from './types'
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
      (day: {date: string; value?: string; location?: Location}) => {
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

  const testTelegram = {
    initData:
      'query_id=AAFDzyovAAAAAEPPKi-gvrY-&user=%7B%22id%22%3A791334723%2C%22first_name%22%3A%22%D0%98%D0%B2%D0%B0%D0%BD%22%2C%22last_name%22%3A%22%D0%91%D1%83%D0%B1%D0%B5%D0%BD%D1%91%D0%B2%22%2C%22username%22%3A%22EvanEnev%22%2C%22language_code%22%3A%22en%22%2C%22is_premium%22%3Atrue%2C%22allows_write_to_pm%22%3Atrue%7D&auth_date=1719201025&hash=3414e6ab1efc66838c4b811e881414ec201f988924d2f759b42b16db1282c016',
    initDataUnsafe: {
      query_id: 'AAFDzyovAAAAAEPPKi-gvrY-',
      user: {
        id: 791334723,
        first_name: 'Иван',
        last_name: 'Бубенёв',
        username: 'EvanEnev',
        language_code: 'en',
        is_premium: true,
        allows_write_to_pm: true,
      },
      auth_date: '1719201025',
      hash: '3414e6ab1efc66838c4b811e881414ec201f988924d2f759b42b16db1282c016',
    },
    version: '7.4',
    platform: 'tdesktop',
    colorScheme: 'dark',
    themeParams: {
      accent_text_color: '#6ab2f2',
      bg_color: '#17212b',
      button_color: '#5288c1',
      button_text_color: '#ffffff',
      destructive_text_color: '#ec3942',
      header_bg_color: '#17212b',
      hint_color: '#708499',
      link_color: '#6ab3f3',
      secondary_bg_color: '#232e3c',
      section_bg_color: '#17212b',
      section_header_text_color: '#6ab3f3',
      subtitle_text_color: '#708499',
      text_color: '#f5f5f5',
    },
    isExpanded: true,
    viewportHeight: 710,
    viewportStableHeight: 710,
    isClosingConfirmationEnabled: false,
    headerColor: '#17212b',
    backgroundColor: '#17212b',
    BackButton: {
      isVisible: false,
    },
    MainButton: {
      text: 'CONTINUE',
      color: '#5288c1',
      textColor: '#ffffff',
      isVisible: false,
      isProgressVisible: false,
      isActive: true,
    },
    SettingsButton: {
      isVisible: false,
    },
    HapticFeedback: {},
    CloudStorage: {},
    BiometricManager: {
      isInited: false,
      isBiometricAvailable: false,
      biometricType: 'unknown',
      isAccessRequested: false,
      isAccessGranted: false,
      isBiometricTokenSaved: false,
      deviceId: '',
    },
  }

  useEffect(() => {
    if (hasMounted.current) return
    hasMounted.current = true

    if (Object.keys(telegram).length) return
    // const appTelegram = (window as any)?.Telegram?.WebApp
    const appTelegram = testTelegram
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
