import db from '@/lib/database'
import {NextRequest, NextResponse} from 'next/server'
import capitalize from '@/lib/functions/capitalize'
import {GoogleSpreadsheetRow} from 'google-spreadsheet'
import google from '@/lib/google'
import {auth} from '@/lib/auth'
import {headers} from 'next/headers'
import {getData} from '@/lib/auth/generateCustomSession'

export async function POST(req: NextRequest) {
  const sessionData = await auth.api.getSession({
    headers: await headers(),
  })

  const user = sessionData?.user
  const session = sessionData?.session

  const body = await req.json()

  const data = body.data

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

  if (!data.authId) {
    return NextResponse.json({message: 'Соц. сеть не привязана'}, {status: 500})
  }

  if (!data.invited_by) {
    return NextResponse.json({message: 'Не указан куратор'}, {status: 500})
  }

  const providers = await auth.api.listUserAccounts({headers: await headers()})

  let telegramId: null | number = null
  if (providers[0].id === 'telegram') {
    const query = `select email from auth."user" where id = '${providers[0].userId}'`
    const result = await db.query(query)

    if (result.rows[0]?.email) {
      telegramId = Number(result.rows[0].email)
    }
  }

  const firstName = capitalize(data.first_name.trim())
  const lastName = capitalize(data.last_name.trim())
  const middleName = capitalize(data.middle_name.trim())

  await google.schedule.loadInfo()

  const sheet = google.schedule.sheetsByTitle['Сотрудники + расписание']
  await sheet.loadHeaderRow(1)
  const rows = await sheet.getRows()

  const row = rows.find(
    (row: GoogleSpreadsheetRow) =>
      row.get('Позывной')?.split('-')[0]?.trim().toLowerCase() ===
      data.name.toLowerCase(),
  )

  const rank = row?.get('Ранг')

  const query = `INSERT
                 INTO workers
                     (name, telegram_id, first_name, last_name, middle_name, email, phone_number, rank_id, auth_id, invited_by)
                 VALUES ('${capitalize(data.name.trim())}',
                         ${telegramId},
                        '${firstName}',
                        '${lastName}',
                        '${middleName}',
                         '${data.email}',
                         '${data.phone}',
                         (select id from ranks where unaccent(name) ilike unaccent('${capitalize(rank) || 'Актёр'}')),
                         '${data.authId}',
                         ${data.invited_by}
                        )
                 `

  await db.query(query)

  const worker = await getData(session!.userId, session!.userId, false)

  return NextResponse.json({worker}, {status: 200})
}
