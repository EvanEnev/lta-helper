import conn from '@/lib/database'
import google from '@/lib/google'
import validateData from '@/lib/validateData'
import getChanges from '@/src/utils/send/getChanges'
import getRandomPhrase from '@/src/utils/send/getRandomPhrase'
import { Day } from '@/src/utils/types'
import { GoogleSpreadsheetRow } from 'google-spreadsheet'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  const body = await req.json()
  const selectedDays: Day[] = body?.selectedDays?.filter(Boolean) || []
  const user = await validateData(body?.initData)

  if (!user) {
    return NextResponse.json({message: 'Ошибка валидации'}, {status: 500})
  }

  if (!selectedDays.length) {
    return NextResponse.json({message: 'Ошибка при выборе дней'}, {status: 400})
  }

  const {id: telegramId} = user
  const workerResult = await conn.query(
    `SELECT "name", "number" FROM lt_arena.workers WHERE telegram_id = $1`,
    [telegramId],
  )
  const worker = workerResult.rows[0]

  if (!worker) {
    return NextResponse.json({}, {status: 404})
  }

  const doc = google()
  await doc.loadInfo()
  const sheet = doc.sheetsByIndex[0]
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

  await sheet.loadHeaderRow(7)

  const {changes, commentsChanges} = await getChanges({sheet, row, selectedDays, workerName: worker.name})
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
    const [day, month] = change.date.split('.').map(v => parseInt(v))
    const dateObject = new Date(2024, month, day)
    const weekday = dateObject.toLocaleDateString('ru-RU', {
      weekday: 'long',
    })

    changesTexts.push(`${change.date} ${change.newValue}${change.comment ? `, ${change.comment}` : ''}`)

    if (change.location) {
      const possibilityText = change.newValue === '+/-' ? 'может с ограничем' : 'не может'
      locationsChangesTexts.push(`⚠️ ${change.location}, ${workerName} **${possibilityText}** ${change.date} (${weekday})${change.comment ? `, ${change.comment}` : ''}`)
    }
  })


  const text = `[${workerName}](tg://user?id=${telegramId})${randomMessage}\n\n${changesTexts.join('\n')}`
  const locationsTexts = locationsChangesTexts.join('\n')

  const botToken = process.env.BOT_TOKEN
  const rank = sheet.getCellByA1(`F${row.rowNumber}`).value
  const chat_id = rank ? -1001949029897 : -1001540720827
  const message_thread_id = rank ? 108 : 2682

  if (commentsChanges.length) {
    const commentsUpdateEntries = commentsChanges.map(comment => {
      return `('${worker.name}', '${comment.date}', '${comment.value}')`
    }).join(',\n')

    const commentsUpdateQuery = `INSERT INTO lt_arena.comments ("worker", "date", "value") VALUES ${commentsUpdateEntries}
     ON CONFLICT (worker, date) DO UPDATE SET value = EXCLUDED.value`

    await conn.query(commentsUpdateQuery)
  }

  const telegramPromises = [
    fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({chat_id: telegramId, text: `Успешно ✅\n\n${changesTexts.join('\n')}`}),
    }),
    fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({
        chat_id,
        message_thread_id,
        text,
        parse_mode: 'Markdown',
      }),
    }),
    fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({
        chat_id: -1001990152890,
        message_thread_id: 3,
        parse_mode: 'Markdown',
        text: locationsTexts,
      }),
    }),
  ]

  await Promise.all(telegramPromises)

  return NextResponse.json({}, {status: 200})
}
