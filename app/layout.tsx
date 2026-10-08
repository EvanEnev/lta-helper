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
}

export const viewport: Viewport = {
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
        <meta name="apple-mobile-web-app-title" content="LTA Helper" />
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
