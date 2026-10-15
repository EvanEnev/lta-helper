import {NextRequest, NextResponse} from 'next/server'
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

export async function POST(req: NextRequest) {
  const {user: worker} = (await auth.api.getSession({
    headers: await headers(),
  })) || {user: null}

  if (!worker) {
    return NextResponse.json({message: 'Ошибка авторизации'}, {status: 500})
  }

  if (!checkPermissions(['edit_payments'], worker)) {
    return NextResponse.json({message: 'Недостаточно прав'}, {status: 500})
  }

  const body = await req.json()

  const startDate = body.startDate
  const endDate = body.endDate

  if (!startDate || !endDate) {
    return NextResponse.json({message: 'Неверные даты'}, {status: 500})
  }

  const acts: Act[] = []

  // Заголовка о следующей странице в новом API нет — листаем, пока не придёт пустой массив
  for (let page = 1; ; page++) {
    const res = await konsolFetch<KonsolAct[]>(
      `/v2/acts?date_from=${startDate}&date_to=${endDate}&status=accepted&per=${PER_PAGE}&page=${page}`,
    )

    if (!res.ok || !Array.isArray(res.data)) {
      return NextResponse.json(
        {message: konsolErrorMessage(res, 'Не удалось получить акты')},
        {status: 500},
      )
    }

    if (!res.data.length) break

    res.data.forEach(act => {
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
    })
  }

  const failed: {act_id: number; number: string; error: string}[] = []

  for (const act of acts) {
    try {
      await db.query(
        `insert into payments.list (worker_id, payment_type, date, act_id, value, paid, comment)
       values ((select id
                from workers
                where unaccent(first_name) ilike unaccent($1)
                  and unaccent(last_name) ilike unaccent($2)),
               2, $3, $4, $5, true, $6)
       on conflict (worker_id, act_id) do update
         set date = excluded.date,
             value = excluded.value,
             comment = excluded.comment`,
        [
          act.contractor.first_name,
          act.contractor.last_name,
          act.date,
          act.id,
          Number(act.amount),
          `Выплата по акту №${act.number}`,
        ],
      )
    } catch (e) {
      console.error(e)
      failed.push({
        act_id: act.id,
        number: act.number,
        error: e instanceof Error ? e.message : String(e),
      })
    }
  }

  if (failed.length) {
    const text = failed.map(a => a.number).join(',\n ')
    return NextResponse.json(
      {warning: `Не всё перенесено:\n${text}`},
      {status: 207},
    )
  } else {
    return NextResponse.json({}, {status: 200})
  }
}
