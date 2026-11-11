import '@/app/globals.css'

import type {Metadata, Viewport} from 'next'
import {Inter, Geist} from 'next/font/google'
import Script from 'next/script'
import Providers from '@/src/components/global/providers/Providers'
import {cn} from '@/lib/utils'

const geist = Geist({subsets: ['latin'], variable: '--font-sans'})

const inter = Inter({subsets: ['latin']})

export const metadata: Metadata = {
  title: 'LTA Helper',
  description: 'Помощник в LTA',
  applicationName: 'LTA Helper',
  appleWebApp: {
    capable: true,
    title: 'LTA Helper',
    statusBarStyle: 'black-translucent',
  },
}

export const viewport: Viewport = {
  themeColor: '#0a0a0a',
  initialScale: 1,
  width: 'device-width',
  userScalable: false,
  maximumScale: 1,
}

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html
      lang="ru"
      className={cn('dark overflow-auto!', 'font-sans', geist.variable)}
      suppressHydrationWarning>
      <head>
        <Script
          src="https://telegram.org/js/telegram-web-app.js?59"
          strategy="afterInteractive"
        />
      </head>
      <body className={inter.className + ' background'}>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
