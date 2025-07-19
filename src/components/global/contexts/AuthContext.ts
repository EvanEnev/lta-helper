import {createContext} from 'react'
import {Day, LTWorker} from '@/src/utils/types'
import {TelegramAuthData} from '@telegram-auth/react'

type Auth = {
  worker: LTWorker
  workingDays: Day[]
  login: (data: TelegramAuthData | string) => Promise<void>
  isLoading: boolean
  headerRef: React.RefObject<HTMLElement | null>
  setExiting: React.Dispatch<React.SetStateAction<boolean>>
  toastOffset: number
  setToastOffset: React.Dispatch<React.SetStateAction<number>>
  pageSettings: {
    label: string
    components: React.ReactNode[]
  }[]
  setPageSettings: React.Dispatch<
    React.SetStateAction<{label: string; components: React.ReactNode[]}[]>
  >
}

const AuthContext = createContext<Auth>({
  worker: {
    name: '',
    id: 0,
    telegramId: 0,
    rank: '',
    permissions: [],
  },
  workingDays: [],
  login: async (data: TelegramAuthData | string): Promise<void> => {},
  isLoading: false,
  headerRef: {current: null},
  setExiting: () => false,
  toastOffset: 0,
  setToastOffset: () => 0,
  pageSettings: [],
  setPageSettings: () => [],
})

export default AuthContext
