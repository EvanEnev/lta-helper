'use client'

import {FormEvent, useMemo, useState} from 'react'
import {LTWorker} from '@/src/utils/types'
import Step1 from '@/src/components/register/Step1'
import Step2 from '@/src/components/register/Step2'
import fetchHandler from '@/src/utils/global/fetchHandler'
import Step3 from '@/src/components/register/Step3'
import {Session} from 'better-auth'

interface RegisterPageProps {
  worker?: LTWorker
  workers: {id: number; name: string}[]
  session?: Session
}

export default function RegisterPage({
  worker: initialWorker,
  workers,
  session,
}: RegisterPageProps) {
  const [worker, setWorker] = useState<LTWorker | undefined>(initialWorker)

  const step = useMemo(() => {
    if (!session) {
      return 1
    } else if (!worker?.id) {
      return 2
    } else if (!worker.isApproved) {
      return 3
    }
  }, [session, worker?.id, worker?.isApproved])

  const handler = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const data = {...Object.fromEntries(new FormData(e.currentTarget))}

    data.authId = session?.userId || ''

    const result = await fetchHandler({
      url: '/api/register',
      method: 'POST',
      body: {data},
    })

    if (result) {
      setWorker(result.worker)
    }
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 p-4">
      <h1 className="text-5xl font-bold">Регистрация</h1>
      <div className="flex max-h-[50%] w-full flex-col items-center justify-center gap-4 sm:w-1/2">
        {step === 1 && <Step1 />}
        {step === 2 && (
          <Step2 worker={worker} handler={handler} workers={workers} />
        )}
        {step === 3 && <Step3 />}
      </div>
    </main>
  )
}
