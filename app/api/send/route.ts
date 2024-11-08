import conn from '@/lib/database'
import google from '@/lib/google'
import validateData from '@/lib/validateData'
import locations from '@/src/utils/locations'
import {Day} from '@/src/utils/types'
import {GoogleSpreadsheetRow} from 'google-spreadsheet'
import {NextRequest, NextResponse} from 'next/server'

interface LocationChange {
  date: string
  weekday: string
  location: string
  value?: string
  comment?: string
}

const BACKGROUND_COLORS: {
  [key: string]: any
} = {
  red: {red: 0.878, green: 0.4, blue: 0.4},
  darkRed: {red: 0.6},
  yellow: {red: 1, green: 0.949, blue: 0.8},
  darkYellow: {red: 1, green: 0.898, blue: 0.6},
  black: {},
}

const backgroundColorsMap: {[key: string]: string} = {
  red: 'Не могу',
  darkRed: 'Не могу',
  black: 'Не могу',
  yellow: 'Могу с огр-ем',
  darkYellow: 'Могу с огр-ем',
}

const compareObjects = (obj1: object, obj2: object) =>
  JSON.stringify(obj1) === JSON.stringify(obj2)

const variants = [
  'сотрудник',
  'работник',
  'испытуемый',
  'игрок',
  'участник',
  'участник тестирования',
  'испытатель',
  'полевой исследователь',
  'участник эксперимента',
]

const getRandomNumber = (limit: number = 2) => {
  return Math.floor(Math.random() * limit)
}

const values: {[key: string]: string} = {
  '+': 'Могу',
  '-': 'Не могу',
  '+/-': 'Могу с огр-ем',
}

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
    (r: GoogleSpreadsheetRow) =>
      r.get('Позывной')?.split('-')[0].trim().toLowerCase() ===
      worker.name.toLowerCase(),
  )

  if (!row) {
    return NextResponse.json(
      {message: 'Сотрудник не найден в таблице'},
      {status: 404},
    )
  }

  await sheet.loadHeaderRow(7)
  const headerValues = sheet.headerValues
    .slice(9, 23)
    .map((val: string) => val.split(' ')[1])

  const rowNumber = row.rowNumber
  const keys = 'JKLMNOPQRSTUVW'.split('')

  await sheet.loadCells(`F${rowNumber}:W${rowNumber}`)

  const changes: string[] = []
  const commentsChanges: string[] = []
  const locationsChanges: LocationChange[] = []

  keys.forEach((key, index) => {
    const date = headerValues[index]
    const day = selectedDays.find(day => day.date === date)

    if (!day?.value) return

    const cell = sheet.getCellByA1(`${key}${rowNumber}`)
    const backgroundColor = cell.effectiveFormat.backgroundColor
    const cellValue = cell.value
    const location = locations.find(v => v === cellValue)
    const comment = comments.find((c: {date: any}) => c.date === date) || {
      value: '',
    }
    let value = cell.value
    const foundedLocation = locations.find(
      location => location.toLowerCase() === day.value?.toLowerCase(),
    )

    const cellValueFromBackground = Object.keys(backgroundColorsMap).find(
      color => compareObjects(backgroundColor, BACKGROUND_COLORS[color]),
    )

    if (cellValueFromBackground) {
      value = backgroundColorsMap[cellValueFromBackground]
    }

    if (locations.includes(cellValue) && day.value === '+') {
      value = 'Могу'
    }

    if (value === values[day.value] && comment.value === day.comment) return
    if (foundedLocation?.toLowerCase() === cellValue.toLowerCase()) return

    const splittedDate = day.date.split('.')
    const dateString = `${splittedDate[1]}.${splittedDate[0]}.2024`

    const dateObject = new Date(dateString)

    const weekday = dateObject.toLocaleDateString('ru-RU', {
      weekday: 'long',
    })

    if (day.comment) {
      commentsChanges.push(
        `('${worker.name}', '${day.date}', '${day.comment}')`,
      )
    }

    if (day.comment && day.comment.length > 1 && value !== '+') {
      cell.note = day.comment
    }

    if (!(day.value === '+/-' && location)) {
      if (foundedLocation) {
        cell.value = foundedLocation
      } else {
        cell.value = values[day.value]
      }
    }

    if (day.value !== '+') {
      if (location && location !== foundedLocation) {
        locationsChanges.push({
          date: day.date,
          weekday,
          location,
          value: day.value,
          comment: day.comment,
        })
      }
    }

    changes.push(
      day.comment === comment.value
        ? `${day.date} ${day.value}`
        : `${day.date} ${day.value} ${day.comment || ''}`,
    )
  })

  await sheet.saveUpdatedCells().catch(() => {})

  if (!changes.length) {
    return NextResponse.json({}, {status: 200})
  }

  const name = worker.name.charAt(0).toUpperCase() + worker.name.slice(1)
  const text = `[${name}](tg://user?id=${telegramId})${
    worker.number
      ? ` (${variants[getRandomNumber(variants.length)]} №${worker.number})`
      : ''
  }\n\n${changes.join('\n')}`
  const botToken = process.env.BOT_TOKEN
  const rank = sheet.getCellByA1(`F${row.rowNumber}`).value
  const chat_id = rank ? -1001949029897 : -1001540720827
  const message_thread_id = rank ? 108 : 2682

  if (commentsChanges.length) {
    const updateCommentsQuery = `INSERT INTO lt_arena.comments ("worker", "date", "value") VALUES ${commentsChanges.join(
      ',\n',
    )} ON CONFLICT (worker, date) DO UPDATE SET value = EXCLUDED.value`

    await conn.query(updateCommentsQuery)
  }

  const telegramPromises = [
    fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({chat_id: telegramId, text: 'Успешно ✅'}),
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
        text: locationsChanges
          .map(
            lc =>
              `⚠️ ${lc.location}, ${worker.name} **${
                lc.value === '+/-' ? 'может с ограничем' : 'не может'
              }** ${lc.date} (${lc.weekday}), ${lc.comment || ''}`,
          )
          .join('\n'),
      }),
    }),
  ]

  await Promise.all(telegramPromises)

  return NextResponse.json({}, {status: 200})
}
