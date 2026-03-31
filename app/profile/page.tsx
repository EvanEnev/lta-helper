import {auth} from '@/lib/auth'
import {headers} from 'next/headers'
import ProfilePage from '@/src/components/profile/ProfilePage'

export default async function Profile() {
  const worker = (await auth.api.getSession({
    headers: await headers(),
  }))!.user

  const accounts = await auth.api.listUserAccounts({headers: await headers()})
  const provides = accounts.map(d => d.providerId)

  return <ProfilePage userProviders={provides} worker={worker} />
}
