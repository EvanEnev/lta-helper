import conn from '@/lib/database'
import google from '@/lib/google'
import validateData from '@/lib/validateData'
import locations from '@/src/utils/locations'
import {Day} from '@/src/utils/types'
import {NextRequest, NextResponse} from 'next/server'

const compareObjects = (obj1: object, obj2: object) => {
  return JSON.stringify(obj1) === JSON.stringify(obj2)
}

const redBackgoundColor = {red: 0.8784314, green: 0.4, blue: 0.4}
const darkRedBackgoundColor = {red: 0.6}
const yellowBackgoundColor = {red: 1, green: 0.9490196, blue: 0.8}
const darkYellowBackgoundColor = {red: 1, green: 0.8980392, blue: 0.6}
const locationGreenBackgoundColor = {
  red: 0.5764706,
  green: 0.76862746,
  blue: 0.49019608,
}

export async function POST(req: NextRequest) {
  const body = await req.json()

  const selectedDays: Day[] | undefined = body?.selectedDays?.filter(
    (day: any) => day,
  )
  const initData: string | undefined = body?.initData
  const user = await validateData(initData)
  if (!user) {
    return NextResponse.json({message: 'Ошибка валидации'}, {status: 500})
  }

  if (!selectedDays?.length) {
    return NextResponse.json({message: 'Ошибка при выборе дней'}, {status: 400})
  }

  const telegramId = user.id
  const query = `SELECT "name" FROM lt_arena.workers WHERE telegram_id=${telegramId}`
  const result = await conn.query(query)

  const worker = result.rows[0]
  const name = worker?.name

  const keys = [
    'J',
    'K',
    'L',
    'M',
    'N',
    'O',
    'P',
    'Q',
    'R',
    'S',
    'T',
    'U',
    'V',
    'W',
  ]

  const formattedDates = selectedDays?.map((day, index) => {
    return {
      date: day.date,
      key: keys[index],
      value: day.value,
      comment: day.comment,
    }
  })

  const changes: string[] = []

  const doc = google()

  await doc.loadInfo()
  const sheet = doc.sheetsByIndex[0]
  const rows = await sheet.getRows()
  const row = rows.find(
    (row: {_rawData: string[]}) =>
      row._rawData[2]?.split(' ')[0].toLowerCase() ===
      worker?.name.toLowerCase(),
  )

  if (!row) return NextResponse.json({}, {status: 404})

  await sheet.loadHeaderRow(7)
  const headerValues = sheet.headerValues
    .slice(9, 23)
    .map((value: string) => value.split(' ')[1])

  const rowIndex = row.rowNumber

  await sheet.loadCells(`F${rowIndex}:W${rowIndex}`)

  const rank = sheet.getCellByA1(`F${rowIndex}`).value

  const locationsChanges: {
    date: string
    location: string
    value?: string
    comment?: string
  }[] = []

  formattedDates?.forEach(async day => {
    if (!headerValues.includes(day.date)) return
    if (!day.value) return

    const cell = sheet.getCellByA1(`${day.key}${rowIndex}`)
    const backgroundColor = cell.effectiveFormat.backgroundColor

    if (
      (cell.value === 'Могу' || locations.includes(cell.value)) &&
      day.value === '+'
    ) {
      return
    }

    if (
      (compareObjects(backgroundColor, redBackgoundColor) ||
        compareObjects(backgroundColor, darkRedBackgoundColor)) &&
      day.value === '-'
    ) {
      return
    }

    if (
      (compareObjects(backgroundColor, yellowBackgoundColor) ||
        compareObjects(backgroundColor, darkYellowBackgoundColor)) &&
      day.value === '+/-'
    ) {
      return
    }

    if (day.value === '+') {
      cell.value = 'Могу'
    } else if (day.value === '-') {
      if (compareObjects(backgroundColor, locationGreenBackgoundColor)) {
        locationsChanges.push({
          date: day.date,
          location: cell.value,
          comment: day.comment,
        })
      }

      cell.stringValue = 'Не могу'
    } else if (day.value === '+/-') {
      if (compareObjects(backgroundColor, locationGreenBackgoundColor)) {
        locationsChanges.push({
          date: day.date,
          location: cell.value,
          value: '+/-',
          comment: day.comment,
        })
      }

      cell.stringValue = 'Могу с огр-ем'
    }

    changes.push(`${day.date} ${day.value} ${day.comment ? day.comment : ''}`)
  })

  await sheet.saveUpdatedCells().catch(() => {})

  if (!changes.length) return NextResponse.json({}, {status: 200})
  const text = `${name}\n\n` + changes?.join('\n')

  await fetch(
    `https://api.telegram.org/bot${process.env.BOT_TOKEN}/sendMessage`,
    {
      method: 'POST',
      headers: new Headers({
        'Content-Type': 'application/json',
      }),
      body: JSON.stringify({chat_id: telegramId, text: 'Успешно ✅'}),
    },
  )

  const chat_id = rank ? -1001949029897 : -1001540720827
  const message_thread_id = rank ? 108 : 2682

  await fetch(
    `https://api.telegram.org/bot${process.env.BOT_TOKEN}/sendMessage`,
    {
      method: 'POST',
      headers: new Headers({
        'Content-Type': 'application/json',
      }),
      body: JSON.stringify({
        chat_id,
        message_thread_id,
        text,
      }),
    },
  )

  const locationsText = locationsChanges.map(
    ({date, location, value = '', comment = ''}) => {
      return `${location} ${worker.name} минус ${date} ${value} ${comment}`
    },
  )

  await fetch(
    `https://api.telegram.org/bot${process.env.BOT_TOKEN}/sendMessage`,
    {
      method: 'POST',
      headers: new Headers({
        'Content-Type': 'application/json',
      }),
      body: JSON.stringify({
        chat_id: -1001990152890,
        message_thread_id: 3,
        text: locationsText.join('\n'),
      }),
    },
  )

  return NextResponse.json({}, {status: 200})
}
