'use client'

import {useEffect, useState} from 'react'
import {Bell, X} from 'lucide-react'
import {Button} from '@/components/ui/button'
import useOnlineStatus from '@/src/hooks/useOnlineStatus'
import {enablePush, getPushState} from '@/src/utils/pwa/push'

const DISMISS_KEY = 'lta-push-dismissed'
const DISMISS_MS = 7 * 24 * 60 * 60 * 1000

const dismissedRecently = () => {
  try {
    return (
      Date.now() - Number(localStorage.getItem(DISMISS_KEY) ?? 0) < DISMISS_MS
    )
  } catch {
    return false
  }
}

export default function PushPrompt() {
  const online = useOnlineStatus()
  const [visible, setVisible] = useState(false)
  const [pending, setPending] = useState(false)

  useEffect(() => {
    if (dismissedRecently()) return

    getPushState()
      .then(state => {
        if (state === 'off' && Notification.permission === 'default') {
          setVisible(true)
        }
      })
      .catch(() => {})
  }, [])

  if (!visible || !online) return null

  const dismiss = () => {
    try {
      localStorage.setItem(DISMISS_KEY, String(Date.now()))
    } catch {}
    setVisible(false)
  }

  const enable = async () => {
    setPending(true)

    try {
      await enablePush()
    } finally {
      setPending(false)
      setVisible(false)
    }
  }

  return (
    <div
      role="dialog"
      aria-label="Напоминания о сменах"
      className="bg-popover text-popover-foreground fixed right-4 bottom-20 left-4 z-40 flex items-start gap-3 rounded-2xl border p-4 shadow-lg sm:bottom-4 sm:left-auto sm:w-96">
      <Bell className="text-primary mt-0.5 size-5 shrink-0" />
      <div className="min-w-0 flex-1">
        <p className="text-base font-medium">Напоминания о сменах</p>
        <p className="text-muted-foreground mt-1 text-sm">
          Пришлём уведомление, если вечером останутся непроставленные смены.
        </p>
        <div className="mt-3 flex gap-2">
          <Button size="sm" disabled={pending} onClick={enable}>
            Включить
          </Button>
          <Button size="sm" variant="ghost" onClick={dismiss}>
            Позже
          </Button>
        </div>
      </div>
      <button
        type="button"
        aria-label="Закрыть"
        onClick={dismiss}
        className="text-muted-foreground hover:text-foreground -mt-1 -mr-1 p-1">
        <X className="size-4" />
      </button>
    </div>
  )
}
