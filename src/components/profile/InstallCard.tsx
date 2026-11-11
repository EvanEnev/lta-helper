'use client'

import {useEffect, useState, useSyncExternalStore} from 'react'
import {CircleCheck, Download} from 'lucide-react'
import {Button} from '@/components/ui/button'
import {Card, CardContent, CardHeader, CardTitle} from '@/components/ui/card'

interface InstallEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{outcome: 'accepted' | 'dismissed'}>
}

const standaloneQuery = () => window.matchMedia('(display-mode: standalone)')

const subscribeStandalone = (notify: () => void) => {
  const query = standaloneQuery()

  query.addEventListener('change', notify)

  return () => query.removeEventListener('change', notify)
}

const isStandalone = () =>
  standaloneQuery().matches ||
  (navigator as Navigator & {standalone?: boolean}).standalone === true

export default function InstallCard() {
  const standalone = useSyncExternalStore(
    subscribeStandalone,
    isStandalone,
    () => false,
  )
  const [justInstalled, setJustInstalled] = useState(false)
  const installed = standalone || justInstalled
  const [event, setEvent] = useState<InstallEvent | null>(null)

  useEffect(() => {
    const onPrompt = (e: Event) => {
      e.preventDefault()
      setEvent(e as InstallEvent)
    }
    const onInstalled = () => {
      setJustInstalled(true)
      setEvent(null)
    }

    window.addEventListener('beforeinstallprompt', onPrompt)
    window.addEventListener('appinstalled', onInstalled)

    return () => {
      window.removeEventListener('beforeinstallprompt', onPrompt)
      window.removeEventListener('appinstalled', onInstalled)
    }
  }, [])

  const install = async () => {
    if (!event) return

    await event.prompt()
    await event.userChoice
    setEvent(null)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Download className="size-5" />
          Приложение
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        {installed ? (
          <p className="text-success flex items-center gap-2 text-sm">
            <CircleCheck className="size-4" />
            Установлено на это устройство
          </p>
        ) : event ? (
          <>
            <p className="text-muted-foreground text-sm">
              Откроется как обычное приложение, работает быстрее и показывает
              уведомления.
            </p>
            <Button className="h-10" onClick={install}>
              <Download />
              Установить
            </Button>
          </>
        ) : (
          <p className="text-muted-foreground text-sm">
            Чтобы установить, откройте меню браузера и выберите «Установить
            приложение». На iPhone: «Поделиться» → «На экран “Домой”».
          </p>
        )}
      </CardContent>
    </Card>
  )
}
