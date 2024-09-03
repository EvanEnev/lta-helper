import conn from '@/lib/database'
import google from '@/lib/google'
import validateData from '@/lib/validateData'
import {Day} from '@/src/utils/types'
import {NextRequest, NextResponse} from 'next/server'

const compareObjects = (obj1: object, obj2: object) => {
  return JSON.stringify(obj1) === JSON.stringify(obj2)
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
    return {date: day.date, key: keys[index], value: day.value}
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

  await sheet.loadHeaderRow()
  const headerValues = sheet.headerValues
    .slice(9, 23)
    .map((value: string) => value.split(' ')[1])

  const workerIndex = rows.indexOf(row)
  const rowIndex = workerIndex + 2

  await sheet.loadCells(`J${rowIndex}:W${rowIndex}`)

  const locationsChanges: {date: string; location: string; value?: string}[] =
    []

  formattedDates?.forEach(async day => {
    if (!headerValues.includes(day.date)) return
    if (!day.value) return

    const cell = sheet.getCellByA1(`${day.key}${rowIndex}`)

    if ((cell.value === 'Могу' || cell.value) && day.value === '+') {
      return
    }

    if (compareObjects(cell.backgroundColor, {red: 1}) && day.value === '-') {
      return
    }

    if (
      compareObjects(cell.backgroundColor, {red: 1, green: 1}) &&
      day.value === '+/-'
    ) {
      return
    }

    if (day.value === '+') {
      cell.value = 'Могу'
      cell.backgroundColor = {green: 1, alpha: 0.5}
    } else if (day.value === '-') {
      if (cell.value) {
        locationsChanges.push({
          date: day.date,
          location: cell.value,
        })
      }

      cell.stringValue = ''
      cell.backgroundColor = {red: 1}
    } else if (day.value === '+/-') {
      if (cell.value) {
        locationsChanges.push({
          date: day.date,
          location: cell.value,
          value: '+/-',
        })
      }

      cell.stringValue = ''
      cell.backgroundColor = {green: 1, red: 1}
    }

    changes.push(`${day.date} ${day.value}`)
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

  // await fetch(
  //   `https://api.telegram.org/bot${process.env.BOT_TOKEN}/sendMessage`,
  //   {
  //     method: 'POST',
  //     headers: new Headers({
  //       'Content-Type': 'application/json',
  //     }),
  //     body: JSON.stringify({
  //       chat_id: -1001949029897,
  //       message_thread_id: 108,
  //       text,
  //     }),
  //   },
  // )

  const locationsText = locationsChanges.map(({date, location, value = ''}) => {
    return `${location} ${worker.name} минус ${date} ${value}`
  })

  // await fetch(
  //   `https://api.telegram.org/bot${process.env.BOT_TOKEN}/sendMessage`,
  //   {
  //     method: 'POST',
  //     headers: new Headers({
  //       'Content-Type': 'application/json',
  //     }),
  //     body: JSON.stringify({
  //       chat_id: -1001990152890,
  //       message_thread_id: 3,
  //       text: locationsText.join('\n'),
  //     }),
  //   },
  // )

  return NextResponse.json({}, {status: 200})
}
