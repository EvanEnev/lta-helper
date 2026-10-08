import {headers} from 'next/headers'
import {auth} from '@/lib/auth'
import db from '@/lib/database'
import safeRedirect from '@/lib/auth/safeRedirect'
import AuthPage from '@/src/components/auth/AuthPage'

interface LoginProps {
  searchParams: Promise<{redirect?: string; error?: string}>
}

export default async function Login({searchParams}: LoginProps) {
  const {redirect, error} = await searchParams
  const session = await auth.api.getSession({headers: await headers()})

  let curators: {id: number; name: string}[] = []

  if (session && !session.user.id) {
    const result = await db.query(
      `select id, name from workers
       where rank_id = 1 and is_fired is not true and is_former is not true
       order by name`,
    )
    curators = result.rows
  }

  const user = session?.user

  return (
    <AuthPage
      account={
        user ? {name: user.name, email: user.email, image: user.image} : null
      }
      worker={user ? JSON.parse(JSON.stringify(user)) : undefined}
      curators={curators}
      callbackURL={safeRedirect(redirect)}
      hasError={!!error}
    />
  )
}
