'use client'

import {useState} from 'react'
import {useRouter} from 'next/navigation'
import {Clock, Loader2, RefreshCw} from 'lucide-react'
import {Button} from '@/components/ui/button'
import {authClient} from '@/lib/auth/authClient'

export default function PendingStep() {
  const router = useRouter()
  const [pending, setPending] = useState(false)

  const check = async () => {
    setPending(true)

    try {
      await authClient.getSession({query: {disableCookieCache: true}})
      router.replace('/')
      router.refresh()
    } finally {
      setTimeout(() => setPending(false), 1500)
    }
  }

  return (
    <div className="flex flex-col items-center gap-4 text-center">
      <div className="bg-muted flex size-14 items-center justify-center rounded-full">
        <Clock className="text-muted-foreground size-7" />
      </div>
      <p className="text-muted-foreground text-base">
        Анкета отправлена. Как только куратор подтвердит её, откроется доступ ко
        всему приложению.
      </p>
      <Button
        variant="outline"
        size="lg"
        className="h-11 w-full"
        disabled={pending}
        onClick={check}>
        {pending ? <Loader2 className="animate-spin" /> : <RefreshCw />}
        Проверить подтверждение
      </Button>
    </div>
  )
}
