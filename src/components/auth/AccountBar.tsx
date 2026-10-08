'use client'

import {useState} from 'react'
import {LogOut} from 'lucide-react'
import {Avatar, AvatarFallback, AvatarImage} from '@/components/ui/avatar'
import {Button} from '@/components/ui/button'
import {authClient} from '@/lib/auth/authClient'

interface AccountBarProps {
  name?: string | null
  email?: string | null
  image?: string | null
}

export default function AccountBar({name, email, image}: AccountBarProps) {
  const [pending, setPending] = useState(false)

  const switchAccount = async () => {
    setPending(true)

    await authClient.signOut(
      {},
      {
        onSuccess: () => {
          try {
            sessionStorage.removeItem('worker')
          } catch {}
          window.location.assign('/login')
        },
        onError: () => setPending(false),
      },
    )
  }

  const label = name || email || 'Аккаунт'

  return (
    <div className="bg-muted/50 flex items-center gap-3 rounded-xl border p-3">
      <Avatar>
        <AvatarImage src={image || ''} alt="" />
        <AvatarFallback>{label.slice(0, 1).toUpperCase()}</AvatarFallback>
      </Avatar>
      <div className="min-w-0 flex-1">
        <p className="truncate text-base font-medium">{label}</p>
        {email && name && (
          <p className="text-muted-foreground truncate text-sm">{email}</p>
        )}
      </div>
      <Button
        variant="ghost"
        size="sm"
        disabled={pending}
        onClick={switchAccount}>
        <LogOut />
        Сменить
      </Button>
    </div>
  )
}
