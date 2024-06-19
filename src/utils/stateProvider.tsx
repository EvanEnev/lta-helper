'use client'

import {createContext, useState} from 'react'
import {Day, User} from './types'

interface GlobalState {
  telegram: any
  setTelegram: (telegram: any) => void
  user: User | undefined
  setUser: (user: User) => void
  worker: any
  setWorker: (worker: any) => void
  selectedDays: Day[]
  setSelectedDays: any
  loading: boolean
  setLoading: (value: boolean) => void
}

export const GlobalStateContext = createContext<GlobalState>({
  telegram: {},
  setTelegram: () => {},
  user: undefined,
  setUser: () => {},
  worker: {},
  setWorker: () => {},
  selectedDays: [],
  setSelectedDays: () => {},
  loading: true,
  setLoading: () => {},
})

export default function StateProvider({children}: {children: any}) {
  const [telegram, setTelegram] = useState<any>({})
  const [user, setUser] = useState<User>()
  const [worker, setWorker] = useState<any>({})
  const [selectedDays, setSelectedDays] = useState<Day[]>([])
  const [loading, setLoading] = useState<boolean>(true)

  const valueData = {
    telegram,
    setTelegram,
    user,
    setUser,
    worker,
    setWorker,
    selectedDays,
    setSelectedDays,
    loading,
    setLoading,
  }

  return (
    <GlobalStateContext.Provider value={valueData}>
      {children}
    </GlobalStateContext.Provider>
  )
}
