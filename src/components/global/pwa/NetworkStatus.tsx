'use client'

import {useEffect, useState} from 'react'
import {CloudUpload, Loader2, TriangleAlert, WifiOff} from 'lucide-react'
import {DateTime} from 'luxon'
import {Button} from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import useOnlineStatus from '@/src/hooks/useOnlineStatus'
import useOutbox from '@/src/hooks/useOutbox'
import {getOutbox} from '@/src/utils/offline/outbox'
import {cachedAt} from '@/src/utils/pwa/register'
import {cn} from '@/lib/utils'

interface NetworkStatusProps {
  userId: number | null
}

export default function NetworkStatus({userId}: NetworkStatusProps) {
  const online = useOnlineStatus()
  const {items, pending, failed} = useOutbox()
  const [open, setOpen] = useState(false)
  const [savedAt, setSavedAt] = useState<number | null>(null)
  const [stale, setStale] = useState(false)
  const [recovered, setRecovered] = useState(false)

  useEffect(() => {
    let cancelled = false

    cachedAt(location.pathname + location.search).then(info => {
      if (cancelled || !info) return

      setSavedAt(info.at)
      setStale(info.stale)
    })

    return () => {
      cancelled = true
    }
  }, [online])

  useEffect(() => {
    if (!stale || recovered) return

    const timer = setInterval(() => {
      fetch('/manifest.webmanifest', {cache: 'no-store'})
        .then(response => {
          if (response.ok) setRecovered(true)
        })
        .catch(() => {})
    }, 15_000)

    return () => clearInterval(timer)
  }, [stale, recovered])

  const offline = !online || stale
  const show = offline || pending > 0 || failed > 0

  if (!show) return null

  const outbox = getOutbox()

  let text = 'Нет сети'
  let Icon = WifiOff

  if (offline) {
    const from = savedAt
      ? `данные от ${DateTime.fromMillis(savedAt).toFormat('dd.MM HH:mm')}`
      : null

    text = recovered
      ? 'Связь появилась · обновить страницу'
      : [
          online ? 'Нет связи с сервером' : 'Нет сети',
          from,
          pending ? `отложено: ${pending}` : null,
        ]
          .filter(Boolean)
          .join(' · ')
  } else if (pending) {
    text = `Отправляю отложенное: ${pending}`
    Icon = Loader2
  } else {
    text = `Не отправлено: ${failed}`
    Icon = TriangleAlert
  }

  return (
    <>
      <button
        type="button"
        role="status"
        onClick={() => (recovered ? location.reload() : setOpen(true))}
        className={cn(
          'bg-popover text-popover-foreground fixed bottom-20 left-1/2 z-40 flex -translate-x-1/2 items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium shadow-lg sm:bottom-4',
          offline && !recovered && 'border-warning/60',
          recovered && 'border-success/60',
          !offline && !pending && failed > 0 && 'border-destructive/60',
        )}>
        <Icon
          className={cn(
            'size-4',
            Icon === Loader2 && 'animate-spin',
            offline && !recovered && 'text-warning',
            !offline && !pending && failed > 0 && 'text-destructive',
          )}
        />
        {text}
      </button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CloudUpload className="size-5" />
              Отложенные действия
            </DialogTitle>
            <DialogDescription>
              Они сохранены на этом устройстве и отправятся сами, когда появится
              связь.
            </DialogDescription>
          </DialogHeader>

          {items.length === 0 ? (
            <p className="text-muted-foreground py-4 text-center text-sm">
              Очередь пуста
            </p>
          ) : (
            <ul className="flex max-h-72 flex-col gap-2 overflow-y-auto">
              {items.map(item => (
                <li
                  key={item.id}
                  className="flex items-start justify-between gap-3 rounded-lg border p-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{item.label}</p>
                    <p className="text-muted-foreground text-xs">
                      {DateTime.fromMillis(item.createdAt).toFormat(
                        'dd.MM HH:mm',
                      )}
                      {item.status === 'pending' ? ' · ждёт отправки' : ''}
                    </p>
                    {item.status === 'failed' && (
                      <p className="text-destructive mt-1 text-xs">
                        {item.error}
                      </p>
                    )}
                  </div>
                  <div className="flex shrink-0 gap-1">
                    {item.status === 'failed' && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => outbox.retry(item.id)}>
                        Повторить
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => outbox.discard(item.id)}>
                      Убрать
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          )}

          <DialogFooter>
            {online && pending > 0 && userId !== null && (
              <Button variant="outline" onClick={() => outbox.flush(userId)}>
                Отправить сейчас
              </Button>
            )}
            <Button onClick={() => setOpen(false)}>Закрыть</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
