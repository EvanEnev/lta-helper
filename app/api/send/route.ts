import db from '@/lib/database'
import google from '@/lib/google'
import getChanges from '@/src/utils/send/getChanges'
import getRandomPhrase from '@/src/utils/send/getRandomPhrase'
import {Day} from '@/src/utils/types'
import {GoogleSpreadsheetRow} from 'google-spreadsheet'
import {NextRequest, NextResponse} from 'next/server'
import createAdminSupabase from '@/lib/createAdminSupabase'
import auth from '@/lib/auth/auth'
import {DateTime} from 'luxon'

export async function POST(req: NextRequest) {
  const supabase = await createAdminSupabase()
  const body = await req.json()
  let selectedDays: Day[] = body?.selectedDays?.filter(Boolean) || []
  const {data: session} = await supabase.auth.getUser()
  const user = session?.user

  if (!user) {
    return NextResponse.json({message: 'Ошибка валидации'}, {status: 500})
  }

  if (!selectedDays.length) {
    return NextResponse.json({message: 'Ошибка при выборе дней'}, {status: 400})
  }

  selectedDays = selectedDays.map(day => ({
    ...day,
    date: DateTime.fromISO(`${day.date}`),
  }))

  const telegramId: number = user.user_metadata.telegram_id

  const worker = await auth()

  if (!worker.name) {
    return NextResponse.json({}, {status: 404})
  }

  await google.schedule.loadInfo()
  const sheet = google.schedule.sheetsByIndex[0]
  await sheet.loadHeaderRow(7)
  const rows = await sheet.getRows()
  const row = rows.find(
    (r: GoogleSpreadsheetRow) =>
      r.get('Позывной')?.split('-')[0]?.trim()?.toLowerCase() ===
      worker.name.toLowerCase(),
  )

  if (!row) {
    return NextResponse.json(
      {message: 'Сотрудник не найден в таблице'},
      {status: 404},
    )
  }

  const {changes, queries} = await getChanges({
    sheet,
    row,
    selectedDays,
    workerName: worker.name,
  })
  const locationsChangesTexts: string[] = []
  const changesTexts: string[] = []

  if (!changes.length) {
    return NextResponse.json({}, {status: 200})
  }

  await sheet.saveUpdatedCells().catch(() => {})

  const randomPhrase = getRandomPhrase()
  const randomMessage = worker.number
    ? ` (${randomPhrase} №${worker.number})`
    : ''

  const workerName = worker.name.charAt(0).toUpperCase() + worker.name.slice(1)

  changes.forEach(change => {
    const date = change.date
    const formattedDate = date.toFormat('dd.MM')
    const weekday = date.toFormat('EEEE', {locale: 'ru-RU'})

    changesTexts.push(
      `${formattedDate} ${change.newValue}${
        change.comment ? `, ${change.comment}` : ''
      }`,
    )

    if (change.location) {
      const possibilityText =
        change.newValue === '+/-' ? 'может с ограничем' : 'не может'
      locationsChangesTexts.push(
        `⚠️ ${change.location}, ${workerName} **${possibilityText}** ${
          formattedDate
        } (${weekday})${change.comment ? `, ${change.comment}` : ''}`,
      )
    }
  })

  const text = `[${workerName}](tg://user?id=${telegramId})${randomMessage}\n\n${changesTexts.join(
    '\n',
  )}`
  const locationsTexts = locationsChangesTexts.join('\n')

  const botToken = process.env.BOT_TOKEN
  const rank = row.get('Ранг')

  const isActor =
    rank && (rank.toLowerCase() === 'актёр' || rank.toLowerCase() === 'актер')

  const chat_id = isActor
    ? process.env.ACTORS_CHAT_ID
    : process.env.WORKERS_CHAT_ID

  const message_thread_id = isActor
    ? process.env.ACTORS_THREAD_ID
    : process.env.WORKERS_THREAD_ID

  const query = queries.join(';\n')

  if (query) {
    await db.query(query)
  }

  const telegramPromises = [
    fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({
        chat_id: telegramId,
        text: `Успешно ✅\n\n${changesTexts.join('\n')}`,
      }),
    }),
    fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({
        chat_id,
        message_thread_id,
        text,
        parse_mode: 'Markdown',
        disable_notification: true,
      }),
    }),
    fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({
        chat_id: process.env.ADMINS_CHAT_ID,
        message_thread_id: process.env.ADMINS_THREAD_ID,
        parse_mode: 'Markdown',
        text: locationsTexts,
      }),
    }),
  ]

  await Promise.all(telegramPromises)

  return NextResponse.json({}, {status: 200})
}
