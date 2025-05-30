import db from '@/lib/database'
import {NextRequest, NextResponse} from 'next/server'
import getDefaultDays from '@/lib/functions/getDefaultDays'
import capitalize from '@/lib/functions/capitalize'
import {GoogleSpreadsheetRow} from 'google-spreadsheet'
import google from '@/lib/google'
import createAdminSupabase from '@/lib/createAdminSupabase'

export async function POST(req: NextRequest) {
  const supabase = await createAdminSupabase()

  const body = await req.json()

  const data = body.data

  const {data: session} = await supabase.auth.getUser()
  const user = session?.user

  if (!user) {
    return NextResponse.json({message: 'Ошибка валидации'}, {status: 500})
  }

  if (!data.name) {
    return NextResponse.json({message: 'Позывной не указан'}, {status: 500})
  }

  if (!data.first_name) {
    return NextResponse.json({message: 'Имя не указано'}, {status: 500})
  }

  if (!data.last_name) {
    return NextResponse.json({message: 'Фамилия не указана'}, {status: 500})
  }

  if (!data.phone) {
    return NextResponse.json({message: 'Телефон не указан'}, {status: 500})
  }

  if (!data.email) {
    return NextResponse.json({message: 'Почта не указана'}, {status: 500})
  }

  const firstName = capitalize(data.first_name.trim())
  const lastName = capitalize(data.last_name.trim())
  const middleName = capitalize(data.middle_name.trim())

  await google.schedule.loadInfo()

  const sheet = google.schedule.sheetsByTitle['Сотрудники + расписание']
  await sheet.loadHeaderRow(7)
  const rows = await sheet.getRows()

  const row = rows.find(
    (row: GoogleSpreadsheetRow) =>
      row.get('Позывной')?.split('-')[0]?.trim().toLowerCase() ===
      data.name.toLowerCase(),
  )

  const rank = row?.get('Ранг')

  const telegramId: number = user.user_metadata.telegram_id

  const query = `INSERT
                 INTO lt_arena.workers
                     (name, telegram_id, first_name, last_name, middle_name, email, phone_number, rank)
                 VALUES ('${capitalize(data.name.trim())}',
                         ${telegramId},
                        '${firstName}',
                        '${lastName}',
                        '${middleName}',
                         '${data.email}',
                         '${data.phone}',
                         '${capitalize(rank) || 'Актёр'}'
                        )
                ON CONFLICT(telegram_id, name) DO UPDATE
                SET first_name = EXCLUDED.first_name,
                    last_name = EXCLUDED.last_name,
                    middle_name = EXCLUDED.middle_name,
                    phone_number = EXCLUDED.phone_number,
                    rank = EXCLUDED.rank,
                    email = EXCLUDED.email
                 `
  await db.query(query)

  const defaultDays = await getDefaultDays()
  const workingDays = defaultDays.map(day => ({date: day}))

  return NextResponse.json({workingDays}, {status: 200})
}
