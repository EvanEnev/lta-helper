import {NextRequest, NextResponse} from 'next/server'
import {DateTime} from 'luxon'
import db from '@/lib/database'
import {auth} from '@/lib/auth'
import {headers} from 'next/headers'
import checkPermissions from '@/lib/functions/checkPermissions'

const DATE = /^\d{4}-\d{2}-\d{2}$/

const toIntArray = (value: unknown) =>
  Array.isArray(value) &&
  value.length <= 500 &&
  value.every(item => Number.isInteger(item))
    ? (value as number[])
    : null

export async function POST(req: NextRequest) {
  const {user} = (await auth.api.getSession({
    headers: await headers(),
  })) || {user: null}

  if (!user) {
    return NextResponse.json({message: 'Вход не произведён'}, {status: 401})
  }

  if (!checkPermissions(['view_full_salary'], user)) {
    return NextResponse.json({message: 'Нет прав'}, {status: 403})
  }

  const body = await req.json().catch(() => ({}))
  const {startString, endString} = body

  if (
    !(
      typeof startString === 'string' &&
      typeof endString === 'string' &&
      DATE.test(startString) &&
      DATE.test(endString) &&
      DateTime.fromISO(startString).isValid &&
      DateTime.fromISO(endString).isValid
    )
  ) {
    return NextResponse.json({message: 'Некорректные даты'}, {status: 400})
  }

  const locations = toIntArray(body.locations ?? [])
  const workTypes = toIntArray(body.workTypes ?? [])

  if (!locations || !workTypes) {
    return NextResponse.json({message: 'Некорректные фильтры'}, {status: 400})
  }

  const query = `
    with last_payroll as (select id
                          from payrolls.list
                          where upper(dates) <= $2::date
                          order by upper(dates) desc
                          limit 1)
    select w.id                          as "workerId",
           w.name                        as "workerName",
           r.name                        as rank,
           coalesce(w.is_former, false)  as "isFormer",
           s.*,
           p.value                       as payroll_balance
    from workers w
           join ranks r on w.rank_id = r.id
           cross join lateral functions.get_salary(w.id, $1::date, $2::date,
                                                   $1::date, $2::date,
                                                   $3::int[], $4::int[]) s
           left join lateral (
      select value -
             coalesce(taken, 0) +
             coalesce(bonuses, 0) -
             coalesce(external_payment, 0) as value
      from relations.workers_payrolls wp
      where wp.worker_id = w.id
        and wp.payroll_id = (select id from last_payroll)
      ) p on true
    where s.count != 0 or s.balance != 0
    order by coalesce(w.is_former, false), r.id != 12 desc, w.name`

  const result = await db.query(query, [
    startString,
    endString,
    locations,
    workTypes,
  ])

  return NextResponse.json({data: result.rows}, {status: 200})
}
