import {auth} from '@/lib/auth'
import {headers} from 'next/headers'
import {redirect} from 'next/navigation'
import ProfilePage from '@/src/components/profile/ProfilePage'

export default async function Profile() {
  const requestHeaders = await headers()
  const session = await auth.api.getSession({headers: requestHeaders})

  if (!session) redirect('/login')

  const accounts = await auth.api.listUserAccounts({headers: requestHeaders})

  return (
    <ProfilePage
      userProviders={accounts.map(d => d.providerId)}
      worker={session.user as never}
    />
  )
}
