// 'use client'

// import {createContext, useState} from 'react'
// import {Day, User} from './types'

// interface GlobalState {
//   telegram: any
//   setTelegram: (telegram: any) => void
//   user: User | undefined
//   setUser: (user: User) => void
//   worker: any
//   setWorker: (worker: any) => void
//   selectedDays: Day[]
//   setSelectedDays: any
//   loading: boolean
//   setLoading: (value: boolean) => void
//   days: Day[]
//   setDays: (value: Day[]) => void
//   globalComment: string
//   setGlobalComment: (value: string) => void
// }

// export const GlobalStateContext = createContext<GlobalState>({
//   telegram: {},
//   setTelegram: () => {},
//   user: undefined,
//   setUser: () => {},
//   worker: {},
//   setWorker: () => {},
//   selectedDays: [],
//   setSelectedDays: () => {},
//   loading: true,
//   setLoading: () => {},
//   days: [],
//   setDays: () => {},
//   globalComment: '',
//   setGlobalComment: () => {},
// })

// export default function StateProvider({children}: {children: any}) {
//   const [telegram, setTelegram] = useState<any>({})
//   const [user, setUser] = useState<User>()
//   const [worker, setWorker] = useState<any>({})
//   const [selectedDays, setSelectedDays] = useState<Day[]>([])
//   const [loading, setLoading] = useState<boolean>(true)
//   const [days, setDays] = useState<Day[]>([])
//   const [globalComment, setGlobalComment] = useState<string>('')

//   const valueData = {
//     telegram,
//     setTelegram,
//     user,
//     setUser,
//     worker,
//     setWorker,
//     selectedDays,
//     setSelectedDays,
//     loading,
//     setLoading,
//     days,
//     setDays,
//     globalComment,
//     setGlobalComment,
//   }

//   return (
//     <GlobalStateContext.Provider value={valueData}>
//       {children}
//     </GlobalStateContext.Provider>
//   )
// }
