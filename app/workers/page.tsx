import db from '@/lib/database'
import {LTWorkerData} from '@/src/utils/types'
import {auth} from '@/lib/auth'
import {headers} from 'next/headers'
import WorkersPage from '@/src/components/workers/WorkersPage'
import getRanks from '@/lib/functions/getRanks'

export default async function Workers() {
  const worker = (await auth.api.getSession({
    headers: await headers(),
  }))!.user

  const workersQuery = `
select
  w.id,
  w.name,
  first_name as "firstName",
  last_name as "lastName",
  middle_name as "middleName",
  telegram_id as "telegramId",
  email,
  invited_by as "invitedBy",
  coalesce(is_approved, false) as "isApproved",
  coalesce(is_former, false) as "isFormer",
  coalesce(is_fired, false) as "isFired",
  photo_url as "photoUrl",
  phone_number as "phoneNumber",
  role,
  functions.get_location(location_id) as location,
  functions.get_rank(w.rank_id) as rank,
  q.data as quests,
  g.data as generations,
  case when rr.rank_id is not null then jsonb_agg(jsonb_build_object(
        'id',rr.id,
        'name', rr.name,
        'description', description,
        'limit', "limit",
        'type', type,
        'category', category,
        'meta', meta,
        'value', wr.value,
        'immutable', coalesce(rr.immutable, false),
        'done', (
          case
            when meta ? 'questId' then exists((select id from relations.workers_quests where worker_id = w.id and quest_id = (meta->>'questId')::int))
            when meta ? 'generationId' then exists((select id from relations.workers_generations where worker_id = w.id and generation_id = (meta->>'generationId')::int))
            when rr.type = 'number' then (coalesce(wr.value >= "limit", false))
            else (wr.id is not null)
            end
          )
        ) order by rr.name, rr.category is not null, rr.name) else '[]'::jsonb end as "rankData"
    from workers w
           left join ranks.requirements rr on rr.rank_id = w.rank_id
           left join relations.workers_requirements wr on rr.id = wr.requirement_id and worker_id = w.id
           left join lateral (
             select   coalesce(jsonb_agg(
               jsonb_build_object(
                 'id', wq.quest_id,
                 'name', (select name from quests where id = wq.quest_id)
               )
                               ), '[]'::jsonb) as data
               from relations.workers_quests wq where worker_id = w.id
      ) q on true
           left join lateral (
      select  coalesce( jsonb_agg(
        jsonb_build_object(
          'id', wg.generation_id,
          'name', (select name from generations where id = wg.generation_id)
        )
                        ), '[]'::jsonb) as data
      from relations.workers_generations wg where worker_id = w.id
      ) g on true
    where coalesce(w.is_fired, false) = false
    group by w.id, w.name, first_name, last_name, middle_name, telegram_id, email, is_former, is_fired, photo_url, phone_number, role, location_id, w.rank_id , rr.rank_id, q.data, g.data
    order by "isApproved", coalesce(w.is_former, false), (select sorting_weight from ranks where id = w.rank_id) desc, name`

  const workersResult = await db.query(workersQuery)
  const workers: LTWorkerData[] = workersResult.rows
  const ranks = await getRanks({addon: 'order by sorting_weight desc'})

  return <WorkersPage ranks={ranks} worker={worker} workers={workers} />
}
