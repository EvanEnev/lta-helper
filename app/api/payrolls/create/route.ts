import {NextRequest, NextResponse} from 'next/server'
import db from '@/lib/database'
import {auth} from '@/lib/auth'
import {headers} from 'next/headers'
import checkPermissions from '@/lib/functions/checkPermissions'
import {isDate, toId, toNumber} from '@/lib/payrolls/validate'

const fail = (message: string, status = 400) =>
  NextResponse.json({message}, {status})

const MAX_WORKERS = 2000

export async function POST(req: NextRequest) {
  const {user: worker} = (await auth.api.getSession({
    headers: await headers(),
  })) || {user: null}

  if (!worker) return fail('Вход не произведён', 401)

  if (!checkPermissions(['edit_payrolls'], worker)) {
    return fail('Недостаточно прав', 403)
  }

  const body = await req.json().catch(() => null)

  if (!body?.dates) return fail('Даты не предоставлены')
  if (!body?.takeBy) return fail('Не предоставлена дата выдачи')
  if (!Array.isArray(body?.workersData) || !body.workersData.length) {
    return fail('Не предоставлена информация о сотрудниках')
  }

  const {start, end} = body.dates
  if (!isDate(start) || !isDate(end) || start > end)
    return fail('Некорректные даты')
  if (!isDate(body.takeBy)) return fail('Некорректная дата выдачи')
  if (body.workersData.length > MAX_WORKERS)
    return fail('Слишком много сотрудников')

  const isPublished = body.isPublished === true

  const workers: {
    workerId: number
    value: number
    location: number
    bonuses: number | null
    external: number | null
  }[] = []

  for (const item of body.workersData) {
    const workerId = toId(item?.workerId)
    const value = toNumber(item?.value)
    const balance = toNumber(item?.balance) ?? 0
    const bonuses = toNumber(item?.bonuses)
    const fines = toNumber(item?.fines)
    const external = toNumber(item?.external_payment)
    const location = Number(item?.location)

    if (
      workerId === null ||
      value === undefined ||
      value === null ||
      balance === undefined ||
      bonuses === undefined ||
      fines === undefined ||
      external === undefined ||
      !Number.isInteger(location)
    ) {
      return fail('Некорректные данные сотрудника')
    }

    if (location === -1) continue

    const bonusesSum = (bonuses || 0) + (fines || 0)

    workers.push({
      workerId,
      value: value + balance,
      location,
      bonuses: bonusesSum !== 0 ? bonusesSum : null,
      external: external || null,
    })
  }

  const money: {location: number; value: number | null}[] = []

  for (const item of Array.isArray(body.moneyOnLocations)
    ? body.moneyOnLocations
    : []) {
    const location = toId(item?.location)
    const value = toNumber(item?.value)

    if (location === null || value === undefined) {
      return fail('Некорректные деньги на площадках')
    }

    money.push({location, value: value || null})
  }

  let meta: string | null = null

  if (!isPublished && body.meta) {
    try {
      const parsed =
        typeof body.meta === 'string' ? JSON.parse(body.meta) : body.meta
      meta = JSON.stringify(parsed)
    } catch {
      return fail('Некорректный черновик')
    }
  }

  const client = await db.connect()

  try {
    await client.query('begin')

    const existing = await client.query(
      `select id, is_published
       from payrolls.list
       where dates = daterange($1::date, $2::date, '[]')
       for update`,
      [start, end],
    )

    if (existing.rows[0]?.is_published) {
      await client.query('rollback')

      return fail('Ведомость за этот период уже опубликована', 409)
    }

    const created = await client.query(
      `insert into payrolls.list (dates, take_by, bonuses, created_by, is_published, meta)
       values (daterange($1::date, $2::date, '[]'), $3::date, $4, $5, $6, $7::jsonb)
       on conflict (dates) do update set take_by = excluded.take_by,
                                         is_published = excluded.is_published,
                                         meta = excluded.meta
       returning id`,
      [
        start,
        end,
        body.takeBy,
        body.withBonuses === true ? true : null,
        worker.id,
        isPublished,
        meta,
      ],
    )
    const payrollId: number = created.rows[0].id

    if (isPublished) {
      if (workers.length) {
        await client.query(
          `insert into relations.workers_payrolls
             (worker_id, payroll_id, value, location_id, bonuses, external_payment)
           select w, $1, v, l, b, e
           from unnest($2::int[], $3::numeric[], $4::int[], $5::numeric[], $6::numeric[])
                  as t(w, v, l, b, e)`,
          [
            payrollId,
            workers.map(w => w.workerId),
            workers.map(w => w.value),
            workers.map(w => w.location),
            workers.map(w => w.bonuses),
            workers.map(w => w.external),
          ],
        )
      }

      if (money.length) {
        await client.query(
          `insert into payrolls.locations_money (location_id, payroll_id, value)
           select l, $1, v
           from unnest($2::int[], $3::numeric[]) as t(l, v)`,
          [payrollId, money.map(m => m.location), money.map(m => m.value)],
        )
      }
    }

    await client.query('commit')

    return NextResponse.json({id: payrollId}, {status: 200})
  } catch (e) {
    await client.query('rollback').catch(() => {})
    console.error(e)

    return fail(e instanceof Error ? e.message : 'Ошибка в запросе', 500)
  } finally {
    client.release()
  }
}
