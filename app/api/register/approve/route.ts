import db from '@/lib/database'
import {NextRequest, NextResponse} from 'next/server'
import capitalize from '@/lib/functions/capitalize'
import checkPermissions from '@/lib/functions/checkPermissions'
import {auth} from '@/lib/auth'
import {headers} from 'next/headers'

const toId = (value: unknown) => {
  const id = Number(value)

  return Number.isInteger(id) && id > 0 ? id : null
}

const text = (value: unknown, max: number) =>
  typeof value === 'string' ? value.trim().slice(0, max) : ''

const fail = (message: string, status = 400) =>
  NextResponse.json({message}, {status})

export async function POST(req: NextRequest) {
  const sessionData = await auth.api.getSession({
    headers: await headers(),
  })

  const user = sessionData?.user

  if (!user) return fail('Вход не произведён', 401)

  const data = (await req.json().catch(() => null))?.data ?? {}

  const workerId = toId(data.workerId)
  if (workerId === null) return fail('Сотрудник не указан')

  const name = capitalize(text(data.name, 100))
  const firstName = capitalize(text(data.first_name, 100))
  const lastName = capitalize(text(data.last_name, 100))
  const middleName = capitalize(text(data.middle_name, 100))
  const phone = text(data.phone, 30)
  const email = text(data.email, 200)
  const rankId = toId(data.rank_id)

  if (!name) return fail('Позывной не указан')
  if (!firstName) return fail('Имя не указано')
  if (!lastName) return fail('Фамилия не указана')
  if (!phone) return fail('Телефон не указан')
  if (!email) return fail('Почта не указана')
  if (rankId === null) return fail('Не указан ранг')

  // Подтверждать может пригласивший сотрудника (как и показывает интерфейс)
  // или администратор
  const target = await db.query(
    'select invited_by from workers where id = $1',
    [workerId],
  )

  if (!target.rowCount) return fail('Сотрудник не найден', 404)

  const isAdmin = checkPermissions(['admin'], user)
  const isInviter = Number(target.rows[0].invited_by) === user.id

  if (!isAdmin && !isInviter) return fail('Нет прав', 403)

  // Ранг должен существовать; выше собственного его может задать только
  // тот, у кого есть право менять ранги
  const ranks = await db.query(
    `select
       (select sorting_weight from ranks where id = $1) as target,
       (select sorting_weight from ranks where name = $2) as own`,
    [rankId, user.rank],
  )
  const {target: targetWeight, own: ownWeight} = ranks.rows[0]

  if (targetWeight === null) return fail('Ранг не найден')

  if (
    !checkPermissions(['edit_worker_rank'], user) &&
    targetWeight > (ownWeight ?? -Infinity)
  ) {
    return fail('Нельзя назначить ранг выше собственного', 403)
  }

  await db.query(
    `update workers set
       name = $1,
       first_name = $2,
       last_name = $3,
       middle_name = $4,
       email = $5,
       rank_id = $6,
       phone_number = $7,
       is_approved = true,
       invited_by = null
     where id = $8`,
    [name, firstName, lastName, middleName, email, rankId, phone, workerId],
  )

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
  where w.id = $1
  group by w.id, w.name, first_name, last_name, middle_name, telegram_id, email, is_former, is_fired, photo_url, phone_number, role, location_id, w.rank_id , rr.rank_id, q.data, g.data
  order by coalesce(w.is_former, false), (select sorting_weight from ranks where id = w.rank_id) desc, name
  `

  const workerData = await db.query(workerQuery, [workerId])
  const worker = workerData.rows[0]

  return NextResponse.json(worker, {status: 200})
}
