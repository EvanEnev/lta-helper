import db from '@/lib/database'
import {LTWorkerData} from '@/src/utils/types'
import {auth} from '@/lib/auth'
import {headers} from 'next/headers'
import WorkersPage from '@/src/components/workers/WorkersPage'

export default async function Workers() {
  const worker = (await auth.api.getSession({
    headers: await headers(),
  }))!.user

  const workersQuery = `select
  id,
  name,
  first_name as "firstName",
  last_name as "lastName",
  middle_name as "middleName",
  telegram_id as "telegramId",
  email,
  coalesce(is_former, false) as "isFormer",
  coalesce(is_fired, false) as "isFired",
  photo_url as "photoUrl",
  phone_number as "phoneNumber",
  role,
  functions.get_location(location_id) as location,
  functions.get_rank(rank_id) as rank
  from workers
  order by (select sorting_weight from ranks where id = workers.rank_id) desc, name`

  const workersResult = await db.query(workersQuery)
  const workers: LTWorkerData[] = workersResult.rows

  return <WorkersPage worker={worker} workers={workers} />
}
