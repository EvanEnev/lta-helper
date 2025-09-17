import {NextRequest, NextResponse} from 'next/server'
import createAdminSupabase from '@/lib/createAdminSupabase'
import auth from '@/lib/auth/auth'
import db from '@/lib/database'
import checkPermissions from '@/lib/functions/checkPermissions'

export async function POST(req: NextRequest) {
  const supabase = await createAdminSupabase()
  const {data: session} = await supabase.auth.getUser()
  const user = session?.user

  if (!user) {
    return NextResponse.json({message: 'Ошибка авторизации'}, {status: 500})
  }

  const worker = await auth()

  if (!checkPermissions(['edit_payrolls'], worker)) {
    return NextResponse.json({message: 'Недостаточно прав'}, {status: 400})
  }

  const body = await req.json()

  if (!body?.payroll_id) {
    return NextResponse.json(
      {message: 'Не предоставлена ведомость'},
      {status: 400},
    )
  }

  const deletePayrollQuery = `
  delete from lt_arena.payrolls where id = ${body.payroll_id}`

  await db.query(deletePayrollQuery)

  return NextResponse.json({}, {status: 200})
}
