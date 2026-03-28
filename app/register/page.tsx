import RegisterPage from '@/src/components/register/RegisterPage'
import {auth} from '@/lib/auth'
import {headers} from 'next/headers'
import db from '@/lib/database'

export default async function Register() {
  const worker = (await auth.api.getSession({
    headers: await headers(),
  }))!.user

  let workers: {id: number; name: string}[] = []

  if (!worker.id) {
    const workersQuery = `select id, name from workers
                where rank_id = 1 and
                      is_fired is not true and
                      is_former is not true
                order by name`
    const workersResult = await db.query(workersQuery)
    workers = workersResult.rows
  }

  return <RegisterPage worker={worker} workers={workers} />
}
