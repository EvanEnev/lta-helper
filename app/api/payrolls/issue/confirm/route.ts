import {NextRequest, NextResponse} from 'next/server'
import createAdminSupabase from '@/lib/createAdminSupabase'
import auth from '@/lib/auth/auth'
import db from '@/lib/database'

export async function POST(req: NextRequest) {
  const supabase = await createAdminSupabase()
  const {data: session} = await supabase.auth.getUser()
  const user = session?.user

  if (!user) {
    return NextResponse.json({message: 'Ошибка авторизации'}, {status: 500})
  }

  const body = await req.json()

  if (!body?.workers?.length) {
    return NextResponse.json(
      {message: 'Не предоставлены сотрудники'},
      {status: 400},
    )
  }

  if (!body?.payroll_id) {
    return NextResponse.json(
      {message: 'Не предоставлена ведомость'},
      {status: 400},
    )
  }

  const queries = body.workers.map(
    (data: {id: number; value: number; selectedWorker: string | null}) => {
      return `
        update lt_arena.workers_payrolls
        set
          issue_confirmed=true,
          to_take = ${data.value}${
            data.selectedWorker
              ? `,
          to_take_by = (select id from lt_arena.workers where name ilike '${data.selectedWorker}')`
              : ''
          }
        where worker_id = ${data.id} and payroll_id = ${body.payroll_id}
  `
    },
  )

  await db.query(queries.join(';\n'))

  return NextResponse.json({}, {status: 200})
}
