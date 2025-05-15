import AuthSessionProvider from '@/src/components/global/providers/authSessionProvider'
import {HeroUIProvider} from '@heroui/react'
import Header from '@/src/components/global/header/Header'
import StateProvider from '@/src/components/global/providers/stateProvider'
import AuthProvider from '@/src/components/global/providers/authProvider'
import AlertProvider from '@/src/components/global/providers/alertProvider'

export default function Providers({children}: {children: React.ReactNode}) {
  return (
    <AuthSessionProvider>
      <HeroUIProvider
        locale="ru-RU"
        className="h-screen w-screen max-h-screen max-w-screen">
        <Header />
        <StateProvider>
          <AuthProvider>
            <AlertProvider />
            {children}
          </AuthProvider>
        </StateProvider>
      </HeroUIProvider>
    </AuthSessionProvider>
  )
}
