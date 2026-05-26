import {NextRequest, NextResponse} from 'next/server'
import db from '@/lib/database'
import {auth} from '@/lib/auth'
import {headers} from 'next/headers'

export async function POST(req: NextRequest) {
  const {user} = (await auth.api.getSession({
    headers: await headers(),
  })) || {user: null}

  const body = await req.json()

  if (!user) {
    return NextResponse.json({message: 'Ошибка валидации'}, {status: 500})
  }

  const startString = body.startString
  const endString = body.endString

  if (!(startString && endString)) {
    return NextResponse.json({message: 'Даты не предоставлены'}, {status: 500})
  }

  const locations: number[] = body.locations || []
  const workTypes: number[] = body.workTypes || []

  const query = `select
                   w.id as "workerId",
                   w.name as "workerName",
                   r.name as rank,
                   coalesce(w.is_former, false) as "isFormer",
                   s.value,
                   s.overwork,
                   s.games,
                   s.one_games,
                   s.two_games,
                   s.three_games,
                   s.actor_games,
                   s.bonuses,
                   s.fines,
                   s.count,
                   p.value as balance
                 from workers w
                        join ranks r on w.rank_id = r.id
                        cross join lateral functions.get_salary(w.id,
                                                                '${startString}'::date,
                                                                '${endString}'::date,
                                                                '${startString}'::date,
                                                                '${endString}'::date,
                                                                array[${locations}],
                                                                array[${workTypes}]
                                           ) s
                        join lateral (
                   select value -
                          coalesce(taken, 0) +
                          coalesce(bonuses, 0) -
                          coalesce(external_payment, 0) as value
                   from relations.workers_payrolls wp where wp.worker_id = w.id and payroll_id = (
                     select id from payrolls.list
                     where upper(dates) <= '${endString}'
                     order by upper(dates) desc limit 1
                     )  
                   ) p on true
                 where s.count != 0 or s.balance != 0
                 order by coalesce(w.is_former, false), r.id != 12 desc, w.name`

  const result = await db.query(query)
  const data = result.rows

  return NextResponse.json({data}, {status: 200})
}
