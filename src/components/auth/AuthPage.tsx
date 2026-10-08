'use client'

import {useEffect, useState} from 'react'
import {TriangleAlert} from 'lucide-react'
import {Alert, AlertTitle} from '@/components/ui/alert'
import fetchHandler from '@/src/utils/global/fetchHandler'
import type {LTWorker} from '@/src/utils/types'
import AccountBar from './AccountBar'
import AuthShell from './AuthShell'
import PendingStep from './PendingStep'
import ProfileStep from './ProfileStep'
import SignInStep from './SignInStep'

interface AuthPageProps {
  account: {
    name?: string | null
    email?: string | null
    image?: string | null
  } | null
  worker?: Partial<LTWorker>
  curators: {id: number; name: string}[]
  callbackURL: string
  hasError: boolean
}

export default function AuthPage({
  account,
  worker: initialWorker,
  curators,
  callbackURL,
  hasError,
}: AuthPageProps) {
  const [worker, setWorker] = useState(initialWorker)
  const [isPending, setPending] = useState(false)

  useEffect(() => {
    if (hasError) window.history.replaceState(null, '', '/login')
  }, [hasError])

  const step = !account ? 1 : !worker?.id ? 2 : 3

  const submit = async (data: Record<string, string>) => {
    setPending(true)

    try {
      const result = await fetchHandler({
        url: '/api/register',
        method: 'POST',
        body: {data},
      })

      if (result?.worker) setWorker(result.worker)
    } finally {
      setPending(false)
    }
  }

  const texts = {
    1: {
      title: 'Добро пожаловать',
      description: 'Войдите через соцсеть, чтобы продолжить',
    },
    2: {
      title: 'Расскажите о себе',
      description: 'Эти данные увидит куратор при подтверждении',
    },
    3: {
      title: 'Ждём подтверждения',
      description: 'Куратор должен подтвердить вашу анкету',
    },
  }[step]

  return (
    <AuthShell step={step} {...texts}>
      {hasError && step === 1 && (
        <Alert variant="destructive">
          <TriangleAlert />
          <AlertTitle>Не удалось войти. Попробуйте ещё раз</AlertTitle>
        </Alert>
      )}
      {account && step > 1 && <AccountBar {...account} />}
      {step === 1 && <SignInStep callbackURL={callbackURL} />}
      {step === 2 && (
        <ProfileStep
          worker={worker}
          curators={curators}
          email={account?.email ?? ''}
          isPending={isPending}
          onSubmit={submit}
        />
      )}
      {step === 3 && <PendingStep />}
    </AuthShell>
  )
}
