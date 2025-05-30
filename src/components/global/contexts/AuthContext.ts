import {createContext} from 'react'
import {Day} from '@/src/utils/types'

type Auth = {
  worker: any
  workingDays: Day[]
  login: (data: any) => Promise<any>
  isLoading: boolean
}
const AuthContext = createContext<Auth>({
  worker: {},
  workingDays: [],
  login: async (data: any) => {},
  isLoading: false,
})

export default AuthContext
