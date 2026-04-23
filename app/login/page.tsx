'use client'

import {useSearchParams} from 'next/navigation'
import {Button, Separator, toast} from '@heroui/react'
import {authClient} from '@/lib/auth/authClient'
import {Icon} from '@iconify/react'
import capitalize from '@/lib/functions/capitalize'
import providers from '@/src/utils/global/providers'
import Link from 'next/link'
import {useEffect} from 'react'

export default function Register() {
  const params = useSearchParams()

  const redirect = params.get('redirect')
  const error = params.get('error')
  const callbackURL = redirect ? (redirect === '/' ? '/' : `/${redirect}`) : '/'

  useEffect(() => {
    if (error && error === 'user_not_found') {
      authClient.signOut()
      toast('Пользователь не найден', {
        variant: 'danger',
        timeout: 8000,
      })
    }
  }, [error])

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 p-4">
      <h1 className="text-5xl font-bold">Необходимо войти</h1>
      <div className="flex w-fit flex-col flex-wrap justify-center gap-4">
        {providers.map(provider => (
          <Button
            key={provider.name}
            className="w-full justify-start gap-4"
            slot="icon"
            variant="tertiary"
            onPress={async () => {
              await authClient.signIn.social({
                provider: provider.name,
                callbackURL,
                additionalData: {
                  from: 'login',
                },
              })
            }}>
            <Icon icon={`logos:${provider.icon}`} width="24" height="24" />
            <p>Войти с {capitalize(provider.name)}</p>
          </Button>
        ))}
        <div className="flex max-w-full items-center gap-2">
          <Separator className="flex-1" />
          <p>или</p>
          <Separator className="flex-1" />
        </div>
        <Button className="w-full" slot="icon">
          <Link
            href="/register"
            className="flex h-full w-full items-center justify-center gap-2">
            <Icon icon="solar:user-plus-linear" width="24" height="24" />
            Регистрация
          </Link>
        </Button>
      </div>
    </main>
  )
}
