import google from '@/lib/google'
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

  if (!selectedDays?.length) {
    return NextResponse.json({message: 'Ошибка при выборе дней'}, {status: 400})
  }

  const worker = body?.worker
  const name = worker?.name

  const globalComment = body?.globalComment || ''

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
      row._rawData[2]?.split(' ')[0] === worker?.name,
  )

  if (!row) return

  await sheet.loadHeaderRow()
  const headerValues = sheet.headerValues
    .slice(9, 23)
    .map((value: string) => value.split(' ')[1])

  const workerIndex = rows.indexOf(row)
  const rowIndex = workerIndex + 2

  await sheet.loadCells(`J${rowIndex}:W${rowIndex}`)

  formattedDates?.forEach(async day => {
    if (!headerValues.includes(day.date)) return

    const cell = sheet.getCellByA1(`${day.key}${rowIndex}`)

    if (day.value === cell.value) return

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
      cell.stringValue = ''
      cell.backgroundColor = {red: 1}
    } else {
      cell.stringValue = ''
      cell.backgroundColor = {green: 1, red: 1}
    }

    changes.push(`${day.date} ${day.value}`)
  })

  await sheet.saveUpdatedCells().catch(() => {})

  const text = `${name}\n\n` + changes?.join('\n') + `\n\n${globalComment}`

  await fetch(
    `https://api.telegram.org/bot${process.env.BOT_TOKEN}/sendMessage`,
    {
      method: 'POST',
      headers: new Headers({
        'Content-Type': 'application/json',
      }),
      body: JSON.stringify({chat_id: worker?.id, text: 'Успешно ✅'}),
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

  return NextResponse.json({}, {status: 200})
}
