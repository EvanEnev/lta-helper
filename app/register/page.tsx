import RegisterPage from '@/src/components/register/RegisterPage'
import {auth} from '@/lib/auth'
import {headers} from 'next/headers'

export default async function Register() {
  const worker = (await auth.api.getSession({
    headers: await headers(),
  }))!.user

  return <RegisterPage worker={worker} />
}
