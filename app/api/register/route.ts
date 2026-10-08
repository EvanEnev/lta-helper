import db from '@/lib/database'
import {NextRequest, NextResponse} from 'next/server'
import capitalize from '@/lib/functions/capitalize'
import {GoogleSpreadsheetRow} from 'google-spreadsheet'
import google from '@/lib/google'
import {auth} from '@/lib/auth'
import {headers} from 'next/headers'
import {getData} from '@/lib/auth/getWorkerData'

const text = (value: unknown, max: number) =>
  typeof value === 'string' ? value.trim().slice(0, max) : ''

const fail = (message: string, status = 400) =>
  NextResponse.json({message}, {status})

async function findRank(name: string) {
  try {
    await google.schedule.loadInfo()

    const sheet = google.schedule.sheetsByTitle['Сотрудники + расписание']
    await sheet.loadHeaderRow(1)
    const rows = await sheet.getRows()

    const row = rows.find(
      (row: GoogleSpreadsheetRow) =>
        row.get('Позывной')?.split('-')[0]?.trim().toLowerCase() ===
        name.toLowerCase(),
    )

    return capitalize(row?.get('Ранг') || '') || 'Актёр'
  } catch (e) {
    console.error(e)

    return 'Актёр'
  }
}

export async function POST(req: NextRequest) {
  const requestHeaders = await headers()
  const sessionData = await auth.api.getSession({headers: requestHeaders})

  if (!sessionData) return fail('Вход не произведён', 401)

  const {user, session} = sessionData

  if (user.id) return fail('Анкета уже отправлена', 409)

  const data = (await req.json().catch(() => null))?.data ?? {}

  const name = capitalize(text(data.name, 100))
  const firstName = capitalize(text(data.first_name, 100))
  const lastName = capitalize(text(data.last_name, 100))
  const middleName = capitalize(text(data.middle_name, 100))
  const phone = text(data.phone, 30)
  const email = text(data.email, 200)
  const invitedBy = Number(data.invited_by)

  if (!name) return fail('Позывной не указан')
  if (!firstName) return fail('Имя не указано')
  if (!lastName) return fail('Фамилия не указана')
  if (!middleName) return fail('Отчество не указано')
  if (!/^\+?[\d\s()-]{10,}$/.test(phone)) return fail('Телефон указан неверно')
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
    return fail('Почта указана неверно')
  }
  if (!Number.isInteger(invitedBy) || invitedBy <= 0) {
    return fail('Не указан куратор')
  }

  const curator = await db.query(
    `select 1 from workers
     where id = $1 and rank_id = 1 and is_fired is not true and is_former is not true`,
    [invitedBy],
  )

  if (!curator.rowCount) return fail('Куратор не найден')

  let telegramId: number | null = null
  const accounts = await auth.api.listUserAccounts({headers: requestHeaders})

  if (accounts.some(account => account.providerId === 'telegram')) {
    const result = await db.query(
      'select email from auth."user" where id = $1',
      [session.userId],
    )
    const value = result.rows[0]?.email

    if (/^\d+$/.test(value ?? '')) telegramId = Number(value)
  }

  const rank = await findRank(name)

  try {
    await db.query(
      `insert into workers
         (name, telegram_id, first_name, last_name, middle_name, email,
          phone_number, rank_id, auth_id, invited_by)
       values ($1, $2, $3, $4, $5, $6, $7,
               (select id from ranks where unaccent(name) ilike unaccent($8)),
               $9, $10)`,
      [
        name,
        telegramId,
        firstName,
        lastName,
        middleName,
        email,
        phone,
        rank,
        session.userId,
        invitedBy,
      ],
    )
  } catch (e) {
    if ((e as {code?: string}).code === '23505') {
      return fail('Сотрудник с таким позывным или почтой уже есть', 409)
    }

    console.error(e)

    return fail('Не удалось отправить анкету', 500)
  }

  const {worker} = await getData(session.userId, session.userId, false)

  return NextResponse.json({worker}, {status: 200})
}
