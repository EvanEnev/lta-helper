'use client'

import {useState} from 'react'
import {Loader2} from 'lucide-react'
import {Button} from '@/components/ui/button'
import {authClient} from '@/lib/auth/authClient'
import {ProviderIcon} from '@/src/components/global/BrandIcons'
import capitalize from '@/lib/functions/capitalize'
import providers from '@/src/utils/global/providers'

interface SignInStepProps {
  callbackURL: string
}

export default function SignInStep({callbackURL}: SignInStepProps) {
  const [pending, setPending] = useState<string | null>(null)

  const signIn = async (provider: string) => {
    setPending(provider)

    try {
      await authClient.signIn.social({provider, callbackURL})
    } finally {
      setPending(null)
    }
  }

  return (
    <div className="flex flex-col gap-3">
      {providers.map(provider => (
        <Button
          key={provider.name}
          variant="outline"
          size="lg"
          className="h-12 justify-center gap-3 text-base"
          disabled={!!pending}
          onClick={() => signIn(provider.name)}>
          {pending === provider.name ? (
            <Loader2 className="animate-spin" />
          ) : (
            <ProviderIcon name={provider.name} className="size-6" />
          )}
          Продолжить с {capitalize(provider.name)}
        </Button>
      ))}
      <p className="text-muted-foreground text-center text-sm">
        Если вы здесь впервые, после входа нужно будет заполнить короткую анкету
        и дождаться подтверждения куратора.
      </p>
    </div>
  )
}
