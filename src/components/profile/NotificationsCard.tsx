'use client'

import {useEffect, useState} from 'react'
import {BellRing, Loader2} from 'lucide-react'
import {Button} from '@/components/ui/button'
import {Card, CardContent, CardHeader, CardTitle} from '@/components/ui/card'
import {Switch} from '@/components/ui/switch'
import {toast} from '@/components/ui/toast'
import {
  disablePush,
  enablePush,
  getPushState,
  type PushState,
} from '@/src/utils/pwa/push'

const HINTS: Record<PushState, string> = {
  unsupported:
    'Этот браузер не поддерживает уведомления. На iPhone добавьте приложение на экран «Домой» и откройте его оттуда.',
  denied:
    'Уведомления запрещены в настройках браузера для этого сайта. Разрешите их там и вернитесь сюда.',
  off: 'Напоминания о непроставленных сменах и другие важные события.',
  on: 'Включены на этом устройстве. Каждое устройство настраивается отдельно.',
}

export default function NotificationsCard() {
  const [state, setState] = useState<PushState | null>(null)
  const [pending, setPending] = useState(false)
  const [testing, setTesting] = useState(false)

  useEffect(() => {
    getPushState()
      .then(setState)
      .catch(() => setState('unsupported'))
  }, [])

  const toggle = async (checked: boolean) => {
    setPending(true)

    try {
      if (checked) {
        setState(await enablePush())
      } else {
        await disablePush()
        setState(await getPushState())
      }
    } catch {
      toast.add({title: 'Не удалось изменить настройку', type: 'error'})
    } finally {
      setPending(false)
    }
  }

  const test = async () => {
    setTesting(true)

    try {
      const response = await fetch('/api/notifications/test', {method: 'POST'})

      if (!response.ok) {
        const json = await response.json().catch(() => ({}))

        toast.add({
          title: 'Тест не отправлен',
          description: json.message,
          type: 'error',
        })
      }
    } catch {
      toast.add({title: 'Нет сети', type: 'error'})
    } finally {
      setTesting(false)
    }
  }

  const disabled =
    !state || pending || state === 'unsupported' || state === 'denied'

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between gap-2 text-lg">
          <span className="flex items-center gap-2">
            <BellRing className="size-5" />
            Уведомления
          </span>
          {pending ? (
            <Loader2 className="size-5 animate-spin" />
          ) : (
            <Switch
              aria-label="Уведомления"
              checked={state === 'on'}
              disabled={disabled}
              onCheckedChange={toggle}
            />
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        <p className="text-muted-foreground text-sm">
          {state ? HINTS[state] : 'Проверяю…'}
        </p>
        {state === 'on' && (
          <Button
            variant="outline"
            className="h-10"
            disabled={testing}
            onClick={test}>
            {testing && <Loader2 className="animate-spin" />}
            Отправить тестовое
          </Button>
        )}
      </CardContent>
    </Card>
  )
}
