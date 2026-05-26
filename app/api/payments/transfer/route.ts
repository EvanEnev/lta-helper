import {NextRequest, NextResponse} from 'next/server'
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

  let page = 0

  let res = null

  const acts: Act[] = []

  while (res === null || res.headers.get('x-has-next-page') === 'true') {
    page++

    console.debug(
      page,
      `https://api.konsol.pro/v2/acts?date_from=${startDate}&date_to=${endDate}&page=${page}`,
    )
    res = await fetch(
      `https://api.konsol.pro/v2/acts?date_from=${startDate}&date_to=${endDate}&page=${page}`,
      {
        headers: {
          Authorization: `Bearer ${process.env.KONSOL_TOKEN}`,
        },
      },
    )

    const data = await res.json()
    data.forEach((act: any) => {
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

  const queries: string[] = []

  acts.forEach((act: Act) => {
    queries.push(`insert into payments.list (worker_id, payment_type, date, act_id, value, paid, comment)
                      values ((select id
                               from workers
                               where unaccent(first_name) ilike unaccent('${act.contractor.first_name}')
                                 and unaccent(last_name) ilike unaccent('${act.contractor.last_name}')),
                              2,
                              '${act.date}',
                              ${act.id},
                              ${act.amount},
                              true,
                              'Выплата по акту №${act.number}')
                      on conflict (worker_id, act_id) do update set date=excluded.date,
                                                                    value = excluded.value,
                                                                    comment = excluded.comment`)
  })

  console.debug(queries, acts.length)

  try {
    await db.query(queries.join(';\n'))
    return NextResponse.json({}, {status: 200})
  } catch (e) {
    // @ts-ignore
    console.error(e.message)
    // @ts-ignore
    return NextResponse.json({message: e.message}, {status: 500})
  }
}
