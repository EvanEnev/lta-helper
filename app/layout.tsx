import '@/app/globals.css'

import type {Metadata, Viewport} from 'next'
import {Inter} from 'next/font/google'
import Script from 'next/script'
import Providers from '@/src/components/global/providers/Providers'

const inter = Inter({subsets: ['latin']})

export const metadata: Metadata = {
  title: 'LTA Helper',
  description: 'Помощник в LTA',
}

export const viewport: Viewport = {
  initialScale: 1,
  width: 'device-width',
}

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="ru" className="dark">
      <head>
        <Script
          src="https://telegram.org/js/telegram-web-app.js"
          strategy="beforeInteractive"
        />
      </head>
      <body
        className={
          inter.className +
          ' gradient relative min-h-[100dvh] w-[100dvw] min-w-[100dvw] sm:w-fit'
        }>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
