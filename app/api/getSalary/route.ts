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

  const query = `SELECT
  value,
  bonuses,
  fines,
  s.overwork,
  w.name,
  w.balance,
  r.name as rank,
  w.first_name,
  s.one_games,
  s.two_games,
  s.three_games,
  s.actor_games,
  l.name as location_name
  FROM salary.list s
  LEFT JOIN workers w ON w.id = s.worker_id
  LEFT JOIN locations l ON l.id = s.location_id
  left join ranks r on r.id = w.rank_id 
  WHERE s.date BETWEEN '${startString}' AND '${endString}'
  and coalesce(s.is_confirmed, false) = true`

  const result = await db.query(query)
  const data = result.rows

  return NextResponse.json({data}, {status: 200})
}
