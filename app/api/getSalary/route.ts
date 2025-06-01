import {evaluate} from 'mathjs'
import google, {GoogleDocument} from '@/lib/google'
import updateCells from '@/src/utils/admin/updateCell'
import ranksSalary from '@/src/utils/ranksSalary'
import {WorkerSalary} from '@/src/utils/types'
import {
  GoogleSpreadsheetRow,
  GoogleSpreadsheetWorksheet,
} from 'google-spreadsheet'
import {NextRequest, NextResponse} from 'next/server'
import updatePoints from '@/src/utils/admin/updatePoints'
import createAdminSupabase from '@/lib/createAdminSupabase'
import db from '@/lib/database'
import auth from '@/lib/auth'

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
  w.name,
  w.rank,
  w.first_name
  FROM lt_arena.salary s
  LEFT JOIN lt_arena.workers w ON w.id = s.worker_id
  WHERE s.date BETWEEN '${startString}' AND '${endString}'`

  const result = await db.query(query)
  const data = result.rows

  return NextResponse.json({data}, {status: 200})
}
