'use client'
import Header from '@/src/components/global/header/Header'
import {Provider} from 'jotai'
import {ThemeProvider as NextThemesProvider} from 'next-themes'
import PushNotificationProvider from '@/src/components/global/providers/PushNotificationProvider'
import {TooltipProvider} from '@/components/ui/tooltip'
import {SidebarProvider} from '@/components/ui/sidebar'
import AppSidebar from '@/src/components/global/header/AppSidebar'
import {Toaster} from '@/components/ui/toast'
import {usePathname} from 'next/navigation'

export default function Providers({children}: {children: React.ReactNode}) {
  const path = usePathname()
  const isAuthPage = path === '/login' || path === '/register'

  if (isAuthPage) {
    return (
      <NextThemesProvider attribute="class" defaultTheme="dark">
        <TooltipProvider>
          <Toaster />
          {children}
        </TooltipProvider>
      </NextThemesProvider>
    )
  }

  return (
    <NextThemesProvider attribute="class" defaultTheme="dark">
      <SidebarProvider>
        <TooltipProvider>
          <PushNotificationProvider>
            <div className="relative min-h-dvh w-full min-w-fit pb-16 sm:flex sm:gap-2 sm:pb-0">
              <Provider>
                <Header />
                <AppSidebar />
                <div className="w-full">
                  <Toaster />
                  {children}
                </div>
              </Provider>
            </div>
          </PushNotificationProvider>
        </TooltipProvider>
      </SidebarProvider>
    </NextThemesProvider>
  )
}
