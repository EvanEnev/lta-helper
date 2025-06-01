import {createContext} from 'react'
import {Day, LTWorker} from '@/src/utils/types'
import {TelegramAuthData} from '@telegram-auth/react'

type Auth = {
  worker: LTWorker
  workingDays: Day[]
  login: (data: TelegramAuthData | string) => Promise<void>
  isLoading: boolean
}
const AuthContext = createContext<Auth>({
  worker: {
    name: '',
    id: 0,
    telegramId: 0,
    rank: '',
    permissionLevel: 0,
    permissions: [],
  },
  workingDays: [],
  login: async (data: TelegramAuthData | string): Promise<void> => {},
  isLoading: false,
})

export default AuthContext
