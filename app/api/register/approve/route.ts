import db from '@/lib/database'
import {NextRequest, NextResponse} from 'next/server'
import capitalize from '@/lib/functions/capitalize'
import {auth} from '@/lib/auth'
import {headers} from 'next/headers'

export async function POST(req: NextRequest) {
  const sessionData = await auth.api.getSession({
    headers: await headers(),
  })

  const user = sessionData?.user

  const body = await req.json()

  const data = body.data

  if (!user) {
    return NextResponse.json({message: 'Ошибка валидации'}, {status: 500})
  }

  if (!data.workerId) {
    return NextResponse.json({message: 'Сотрудник не указан'}, {status: 500})
  }

  if (!data.name) {
    return NextResponse.json({message: 'Позывной не указан'}, {status: 500})
  }

  if (!data.first_name) {
    return NextResponse.json({message: 'Имя не указано'}, {status: 500})
  }

  if (!data.last_name) {
    return NextResponse.json({message: 'Фамилия не указана'}, {status: 500})
  }

  if (!data.phone) {
    return NextResponse.json({message: 'Телефон не указан'}, {status: 500})
  }

  if (!data.email) {
    return NextResponse.json({message: 'Почта не указана'}, {status: 500})
  }

  if (!data.rank_id) {
    return NextResponse.json({message: 'Не указан ранг'}, {status: 500})
  }

  const name = capitalize(data.name.trim())
  const firstName = capitalize(data.first_name.trim())
  const lastName = capitalize(data.last_name.trim())
  const middleName = capitalize(data.middle_name.trim())
  const email = data.email.trim()
  const rankId = data.rank_id

  const query = `update workers set
  name = '${name}',
  first_name = '${firstName}',
  last_name = '${lastName}',
  middle_name = '${middleName}',
  email = '${email}',
  rank_id = '${rankId}',
  phone_number = '${data.phone}',
  is_approved = true,
  invited_by = null
  where id = ${data.workerId}`

  await db.query(query)

  const workerQuery = `
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
  where w.id = ${data.workerId}
  group by w.id, w.name, first_name, last_name, middle_name, telegram_id, email, is_former, is_fired, photo_url, phone_number, role, location_id, w.rank_id , rr.rank_id, q.data, g.data
  order by coalesce(w.is_former, false), (select sorting_weight from ranks where id = w.rank_id) desc, name
  `

  const workerData = await db.query(workerQuery)
  const worker = workerData.rows[0]

  return NextResponse.json(worker, {status: 200})
}
