import '@/app/globals.css'

import type {Metadata, Viewport} from 'next'
import {Inter} from 'next/font/google'
import Script from 'next/script'
import Providers from '@/src/components/global/providers/Providers'
import db from '@/lib/database'
import {headers} from 'next/headers'
import ImpersonateBox from '@/src/components/global/ImpersonateBox'
import {auth} from '@/lib/auth'

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

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const {user: worker} = (await auth.api.getSession({
    headers: await headers(),
  })) || {user: {id: -1, rank: ''}}

  let users = []
  // @ts-ignore
  if (worker.trueId === 9) {
    const query = `select w.name, w.telegram_id from workers w left join ranks r on r.id = w.rank_id order by r.sorting_weight desc, w.name`
    const result = await db.query(query)

    users = result.rows
  }

  return (
    <html lang="ru" className="dark">
      <head>
        <meta name="apple-mobile-web-app-title" content="LTA Helper" />
        <Script
          src="https://telegram.org/js/telegram-web-app.js"
          strategy="afterInteractive"
        />
      </head>
      <body className={inter.className}>
        {
          // @ts-ignore
          worker.trueId === 9 && <ImpersonateBox users={users} />
        }
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
