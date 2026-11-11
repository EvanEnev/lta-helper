import {NextRequest, NextResponse} from 'next/server'
import {DateTime} from 'luxon'
import {auth} from '@/lib/auth'
import {headers} from 'next/headers'
import checkPermissions from '@/lib/functions/checkPermissions'
import db from '@/lib/database'
import {konsolErrorMessage, konsolFetch} from '@/lib/konsol'

const PER_PAGE = 100

interface KonsolAct {
  id: number
  number: string
  status: string
  start_date: string
  payment_amount: number
  contractor: {
    first_name: string
    last_name: string
  }
}

interface Act {
  id: number
  contractor: {
    first_name: string
    last_name: string
  }
  number: string
  amount: number
  date: string
}

const DATE = /^\d{4}-\d{2}-\d{2}$/

const fail = (message: string, status = 400) =>
  NextResponse.json({message}, {status})

export async function POST(req: NextRequest) {
  const {user: worker} = (await auth.api.getSession({
    headers: await headers(),
  })) || {user: null}

  if (!worker) return fail('Вход не произведён', 401)
  if (!checkPermissions(['edit_payments'], worker)) {
    return fail('Недостаточно прав', 403)
  }

  const body = await req.json().catch(() => ({}))
  const {startDate, endDate} = body

  if (
    !(
      typeof startDate === 'string' &&
      typeof endDate === 'string' &&
      DATE.test(startDate) &&
      DATE.test(endDate) &&
      DateTime.fromISO(startDate).isValid &&
      DateTime.fromISO(endDate).isValid
    )
  ) {
    return fail('Неверные даты')
  }

  const acts: Act[] = []

  for (let page = 1; ; page++) {
    const res = await konsolFetch<KonsolAct[]>(
      `/v2/acts?date_from=${startDate}&date_to=${endDate}&status=accepted&per=${PER_PAGE}&page=${page}`,
    )

    if (!res.ok || !Array.isArray(res.data)) {
      return fail(konsolErrorMessage(res, 'Не удалось получить акты'), 502)
    }

    if (!res.data.length) break

    for (const act of res.data) {
      if (act.status === 'paid') {
        acts.push({
          number: act.number,
          id: act.id,
          date: act.start_date,
          amount: act.payment_amount,
          contractor: {
            first_name: act.contractor.first_name,
            last_name: act.contractor.last_name,
          },
        })
      }
    }
  }

  const client = await db.connect()
  const skipped: string[] = []
  const failed: string[] = []
  let imported = 0

  try {
    await client.query('begin')

    for (const act of acts) {
      const match = await client.query(
        `select id
         from workers
         where unaccent(first_name) ilike unaccent($1)
           and unaccent(last_name) ilike unaccent($2)
         limit 2`,
        [act.contractor.first_name, act.contractor.last_name],
      )

      if (match.rowCount !== 1) {
        skipped.push(
          `${act.contractor.last_name} ${act.contractor.first_name}`.trim(),
        )
        continue
      }

      try {
        await client.query('savepoint act')
        await client.query(
          `insert into payments.list (worker_id, payment_type, date, act_id, value, paid, comment)
         values ($1, 2, $2::date, $3, $4, true, $5)
         on conflict (worker_id, act_id) do update set date = excluded.date,
                                                       value = excluded.value,
                                                       comment = excluded.comment`,
          [
            match.rows[0].id,
            act.date,
            act.id,
            act.amount,
            `Выплата по акту №${act.number}`,
          ],
        )
        await client.query('release savepoint act')
        imported++
      } catch (e) {
        await client.query('rollback to savepoint act')
        console.error(e)
        failed.push(act.number)
      }
    }

    await client.query('commit')
  } catch (e) {
    await client.query('rollback').catch(() => {})
    console.error(e)

    return fail(e instanceof Error ? e.message : 'Ошибка в запросе', 500)
  } finally {
    client.release()
  }

  const warnings = [
    skipped.length
      ? `Не перенесены (сотрудник не найден или не однозначен): ${[...new Set(skipped)].join(', ')}`
      : '',
    failed.length ? `Не перенесены акты: ${failed.join(', ')}` : '',
  ].filter(Boolean)

  return NextResponse.json(
    {imported, warning: warnings.join('\n')},
    {status: failed.length ? 207 : 200},
  )
}
