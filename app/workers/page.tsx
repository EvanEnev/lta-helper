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
  w.id,
  w.name,
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
  functions.get_rank(w.rank_id) as rank,
  case when rr.rank_id is not null then jsonb_agg(jsonb_build_object(
        'id',rr.id,
        'name', rr.name,
        'description', description,
        'limit', "limit",
        'type', type,
        'category', category,
        'value', wr.value,
        'done', (case when rr.type = 'number' then (coalesce(wr.value >= "limit", false)) else (wr.id is not null) end)
        )) else '[]'::jsonb end as "rankData"
    from workers w
           left join ranks.requirements rr on rr.rank_id = w.rank_id
           left join relations.workers_requirements wr on rr.id = wr.requirement_id and worker_id = w.id

    group by w.id, w.name, first_name, last_name, middle_name, telegram_id, email, is_former, is_fired, photo_url, phone_number, role, location_id, w.rank_id , rr.rank_id
    order by (select sorting_weight from ranks where id = w.rank_id) desc, name`

  const workersResult = await db.query(workersQuery)
  const workers: LTWorkerData[] = workersResult.rows

  return <WorkersPage worker={worker} workers={workers} />
}
