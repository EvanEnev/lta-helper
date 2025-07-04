import {NextRequest, NextResponse} from 'next/server'
import createAdminSupabase from '@/lib/createAdminSupabase'
import db from '@/lib/database'

export async function POST(req: NextRequest) {
  const supabase = await createAdminSupabase()

  const body = await req.json()
  const {data: session} = await supabase.auth.getUser()
  const user = session?.user

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
  overwork,
  w.name,
  w.rank,
  w.first_name,
  l.name as location_name
  FROM lt_arena.salary s
  LEFT JOIN lt_arena.workers w ON w.id = s.worker_id
  LEFT JOIN lt_arena.locations l ON l.id = s.location_id
  WHERE s.date BETWEEN '${startString}' AND '${endString}'`

  const result = await db.query(query)
  const data = result.rows

  return NextResponse.json({data}, {status: 200})
}
