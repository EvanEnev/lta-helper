import {headers} from 'next/headers'
import {auth} from '@/lib/auth'
import {getCurators} from '@/lib/internship/curators'
import safeRedirect from '@/lib/auth/safeRedirect'
import AuthPage from '@/src/components/auth/AuthPage'

interface LoginProps {
  searchParams: Promise<{redirect?: string; error?: string}>
}

export default async function Login({searchParams}: LoginProps) {
  const {redirect, error} = await searchParams
  const session = await auth.api.getSession({headers: await headers()})

  let curators: {id: number; name: string}[] = []
  let telegramLinked = false

  if (session && !session.user.id) {
    curators = await getCurators()

    const accounts = await auth.api.listUserAccounts({
      headers: await headers(),
    })

    telegramLinked = accounts.some(a => a.providerId === 'telegram')
  }

  const user = session?.user

  return (
    <AuthPage
      account={
        user ? {name: user.name, email: user.email, image: user.image} : null
      }
      worker={user ? JSON.parse(JSON.stringify(user)) : undefined}
      curators={curators}
      telegramLinked={telegramLinked}
      callbackURL={safeRedirect(redirect)}
      hasError={!!error}
    />
  )
}
