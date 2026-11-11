'use client'

import {ReactNode, useEffect} from 'react'
import {toast} from '@/components/ui/toast'
import useWorker from '@/src/hooks/useWorker'
import checkPermissions from '@/lib/functions/checkPermissions'
import {getOutbox, setOutboxUser} from '@/src/utils/offline/outbox'
import {syncPush} from '@/src/utils/pwa/push'
import {
  registerServiceWorker,
  setCacheUser,
  warmPages,
} from '@/src/utils/pwa/register'
import NetworkStatus from './NetworkStatus'
import PushPrompt from './PushPrompt'

const FLUSH_INTERVAL_MS = 30_000

export default function PwaProvider({children}: {children: ReactNode}) {
  const user = useWorker()
  const userId = typeof user?.id === 'number' ? user.id : null
  const isAdmin = !!user && checkPermissions(['set_salary'], user)

  useEffect(() => {
    registerServiceWorker()
      .then(() => syncPush())
      .catch(() => {})
  }, [])

  useEffect(() => {
    if (userId === null) return

    const warm = () => {
      if (navigator.onLine) warmPages().catch(() => {})
    }

    setCacheUser(userId)
      .then(() => setTimeout(warm, 3000))
      .catch(() => {})

    window.addEventListener('online', warm)

    return () => window.removeEventListener('online', warm)
  }, [userId])

  useEffect(() => {
    setOutboxUser(userId)

    if (userId === null) return

    const outbox = getOutbox()

    const flush = async () => {
      if (!navigator.onLine) return

      const result = await outbox.flush(userId)

      if (result.sent) {
        toast.add({
          title: 'Отложенные действия отправлены',
          description: `Отправлено: ${result.sent}`,
          type: 'success',
        })
        window.dispatchEvent(new CustomEvent('outbox:flushed'))
      }

      if (result.failed) {
        toast.add({
          title: 'Не все действия отправились',
          description: 'Откройте список, чтобы повторить или убрать',
          type: 'error',
        })
      }
    }

    outbox
      .purgeOthers(userId)
      .then(flush)
      .catch(() => {})

    const onVisible = () => {
      if (document.visibilityState === 'visible') flush()
    }

    window.addEventListener('online', flush)
    document.addEventListener('visibilitychange', onVisible)
    const timer = setInterval(flush, FLUSH_INTERVAL_MS)

    return () => {
      window.removeEventListener('online', flush)
      document.removeEventListener('visibilitychange', onVisible)
      clearInterval(timer)
    }
  }, [userId])

  return (
    <>
      {children}
      <NetworkStatus userId={userId} />
      {isAdmin && <PushPrompt />}
    </>
  )
}
