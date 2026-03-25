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

  const query = `select
                   w.id as "workerId",
                   w.name as "workerName",
                   r.name as rank,
                   coalesce(w.is_former, false) as "isFormer",
                   s.*
                 from workers w
                        join ranks r on w.rank_id = r.id
                        cross join lateral functions.get_salary(w.id,
                                                                '${startString}'::date,
                                                                '${endString}'::date,
                                                                '${startString}'::date,
                                                                '${endString}'::date,
                                                                array[${locations}]
                                           ) s
                 where s.count != 0
                 order by coalesce(w.is_former, false), r.id != 12 desc, w.name`

  const result = await db.query(query)
  const data = result.rows

  return NextResponse.json({data}, {status: 200})
}
