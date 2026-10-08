import {NextRequest, NextResponse} from 'next/server'
import {DateTime} from 'luxon'
import {auth} from '@/lib/auth'
import {headers} from 'next/headers'
import checkPermissions from '@/lib/functions/checkPermissions'
import db from '@/lib/database'

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

  try {
    let page = 0
    let hasNext = true

    while (hasNext) {
      page++

      const url = new URL('https://api.konsol.pro/v2/acts')
      url.searchParams.set('date_from', startDate)
      url.searchParams.set('date_to', endDate)
      url.searchParams.set('page', String(page))

      const res = await fetch(url, {
        headers: {Authorization: `Bearer ${process.env.KONSOL_TOKEN}`},
      })

      if (!res.ok) return fail(`Консоль вернула ошибку ${res.status}`, 502)

      const data = await res.json()

      for (const act of Array.isArray(data) ? data : []) {
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

      hasNext = res.headers.get('x-has-next-page') === 'true'
    }
  } catch (e) {
    console.error(e)

    return fail('Не удалось получить данные из Консоли', 502)
  }

  const client = await db.connect()
  const skipped: string[] = []
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
      imported++
    }

    await client.query('commit')
  } catch (e) {
    await client.query('rollback').catch(() => {})
    console.error(e)

    return fail(e instanceof Error ? e.message : 'Ошибка в запросе', 500)
  } finally {
    client.release()
  }

  return NextResponse.json(
    {
      imported,
      warning: skipped.length
        ? `Не перенесены (сотрудник не найден или не однозначен): ${[...new Set(skipped)].join(', ')}`
        : '',
    },
    {status: 200},
  )
}
