import conn from '@/lib/database'
import google from '@/lib/google'
import validateData from '@/lib/validateData'
import locations from '@/src/utils/locations'
import {Day} from '@/src/utils/types'
import {NextRequest, NextResponse} from 'next/server'

const BACKGROUND_COLORS = {
  red: {red: 0.878, green: 0.4, blue: 0.4},
  darkRed: {red: 0.6},
  yellow: {red: 1, green: 0.949, blue: 0.8},
  darkYellow: {red: 1, green: 0.898, blue: 0.6},
  locationGreen: {red: 0.576, green: 0.769, blue: 0.49},
}

const compareObjects = (obj1: object, obj2: object) =>
  JSON.stringify(obj1) === JSON.stringify(obj2)

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
    `SELECT "name" FROM lt_arena.workers WHERE telegram_id = $1`,
    [telegramId],
  )
  const worker = workerResult.rows[0]

  if (!worker) {
    return NextResponse.json({}, {status: 404})
  }

  const commentsData = await conn.query(
    `SELECT date, value FROM lt_arena.comments WHERE worker = $1`,
    [worker.name],
  )
  const comments = commentsData.rows

  const doc = google()
  await doc.loadInfo()
  const sheet = doc.sheetsByIndex[0]
  const rows = await sheet.getRows()
  const row = rows.find(
    (r: {_rawData: string[]}) =>
      r._rawData[2]?.split('-')[0].trim().toLowerCase() ===
      worker.name.toLowerCase(),
  )

  if (!row) {
    return NextResponse.json({}, {status: 404})
  }

  const formattedDates = selectedDays.map((day, index) => ({
    date: day.date,
    key: 'JKLMNOPQRSTUVW'[index],
    value: day.value,
    comment: day.comment,
  }))

  await sheet.loadHeaderRow(7)
  const headerValues = sheet.headerValues
    .slice(9, 23)
    .map((val: string) => val.split(' ')[1])

  await sheet.loadCells(`F${row.rowNumber}:W${row.rowNumber}`)

  const changes: string[] = []
  let updateCommentsQuery = `INSERT INTO lt_arena.comments ("worker", "date", "value") VALUES`
  const locationsChanges: {
    date: string
    location: string
    value?: string
    comment?: string
  }[] = []

  for (const day of formattedDates) {
    if (!headerValues.includes(day.date) || !day.value) continue

    const cell = sheet.getCellByA1(`${day.key}${row.rowNumber}`)
    const backgroundColor = cell.effectiveFormat.backgroundColor
    const cellValue = cell.value
    const comment = comments.find(c => c.date === day.date) || ''

    const shouldSkip =
      ((cellValue === 'Могу' || locations.includes(cellValue)) &&
        day.value === '+') ||
      (compareObjects(backgroundColor, BACKGROUND_COLORS.red) &&
        day.value === '-') ||
      (compareObjects(backgroundColor, BACKGROUND_COLORS.yellow) &&
        day.value === '+/-') ||
      day.comment === comment.value

    if (shouldSkip) continue

    if (day.comment) {
      updateCommentsQuery += `\n('${worker.name}', '${day.date}', '${day.comment}'),`
    }

    switch (day.value) {
      case '+':
        cell.value = 'Могу'
        break
      case '-':
        if (locations.includes(cell.value)) {
          locationsChanges.push({
            date: day.date,
            location: cellValue,
            comment: day.comment,
          })
        }
        cell.value = 'Не могу'
        break
      case '+/-':
        if (locations.includes(cell.value)) {
          locationsChanges.push({
            date: day.date,
            location: cellValue,
            value: '+/-',
            comment: day.comment,
          })
        }

        if (day.comment) {
          cell.note = `${day.date} ${day.comment}`
        }

        cell.value = 'Могу с огр-ем'
        break
    }

    changes.push(`${day.date} ${day.value} ${day.comment || ''}`)
  }

  await sheet.saveUpdatedCells().catch(() => {})

  if (!changes.length) {
    return NextResponse.json({}, {status: 200})
  }

  const name = worker.name.charAt(0).toUpperCase() + worker.name.slice(1)
  const text = `[${name}](tg://user?id=${telegramId})\n\n${changes.join('\n')}`
  const botToken = process.env.BOT_TOKEN
  const rank = sheet.getCellByA1(`F${row.rowNumber}`).value
  const chat_id = rank ? -1001949029897 : -1001540720827
  const message_thread_id = rank ? 108 : 2682

  updateCommentsQuery =
    updateCommentsQuery.slice(0, -1) +
    ' ON CONFLICT (worker, date) DO UPDATE SET value = EXCLUDED.value'

  await conn.query(updateCommentsQuery)

  const response = await fetch(
    `https://api.telegram.org/bot${botToken}/sendMessage`,
    {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({
        chat_id: -1002462902367,
        message_thread_id: 1,
        text,
        parse_mode: 'Markdown',
      }),
    },
  )

  console.log(await response.json())

  const telegramPromises = [
    fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({chat_id: telegramId, text: 'Успешно ✅'}),
    }),
    // fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
    //   method: 'POST',
    //   headers: {'Content-Type': 'application/json'},
    //   body: JSON.stringify({
    //     chat_id: -1002462902367,
    //     message_thread_id: 1,
    //     text,
    //     parse_mode: 'Markdown',
    //   }),
    // }),
    // fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
    //   method: 'POST',
    //   headers: {'Content-Type': 'application/json'},
    //   body: JSON.stringify({
    //     chat_id,
    //     message_thread_id,
    //     text,
    //     parse_mode: 'Markdown',
    //   }),
    // }),
    // fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
    //   method: 'POST',
    //   headers: {'Content-Type': 'application/json'},
    //   body: JSON.stringify({
    //     chat_id: -1001990152890,
    //     message_thread_id: 3,
    //     text: locationsChanges
    //       .map(
    //         lc =>
    //           `${lc.location}, ${worker.name} ${
    //             lc.value ? 'может с ограничем' : 'не может'
    //           } ${lc.date}, ${lc.comment || ''}`,
    //       )
    //       .join('\n'),
    // }),
    // }),
  ]

  await Promise.all(telegramPromises)

  return NextResponse.json({}, {status: 200})
}
