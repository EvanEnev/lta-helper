'use client'

import {Button} from '@heroui/react'
import {usePathname} from 'next/navigation'
import fetchHandler from '@/src/utils/global/fetchHandler'

export default function Error({
  error,
  reset,
}: {
  error: Error & {digest?: string}
  reset: () => void
}) {
  const path = usePathname()

  return (
    <main className="flex h-full w-full flex-col items-center justify-center gap-4 p-6">
      <h1 className="text-xl font-bold">Что-то пошло не так</h1>
      <pre className="mt-4 text-sm opacity-70">{error.message}</pre>

      <div className="flex flex-col items-center gap-4">
        <Button className="w-full" variant="tertiary" onPress={reset}>
          Повторить
        </Button>
        <Button
          className="w-full"
          onPress={async () => {
            const body = {
              error: {message: error.message, stack: error.stack},
              page: path,
              server: !!error.digest,
            }

            console.debug(body)
            await fetchHandler({url: '/api/sendError', method: 'POST', body})
          }}>
          Отправить ошибку Эвану
        </Button>
      </div>
    </main>
  )
}
