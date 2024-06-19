import conn from '@/lib/database'
import google from '@/lib/google'
import validateData from '@/lib/validateData'
import getLocation from '@/src/utils/getLocation'
import {User} from '@/src/utils/types'
import {NextRequest, NextResponse} from 'next/server'

const compareObjects = (obj1: object, obj2: object) => {
  return JSON.stringify(obj1) === JSON.stringify(obj2)
}

export async function POST(req: NextRequest) {
  const body = await req.json()

  const user: User | undefined = body?.user

  if (!(user && Object.keys(user)?.length !== 0)) {
    return NextResponse.json({message: 'Пользователь не указан'}, {status: 404})
  }

  const valid = await validateData(user?.initData)
  if (!valid) {
    return NextResponse.json({message: 'Ошибка валидации'}, {status: 500})
  }

  const telegramId = user?.initDataUnsafe?.user?.id
  const query = `SELECT * FROM "lt-arena"."workers" WHERE telegram_id=${telegramId} ORDER BY "id" ASC`
  const result = await conn.query(query)
  const object = result.rows[0]

  const worker = {
    name: object?.name,
    surname: object?.surname,
    lastName: object?.last_name,
    id: object?.telegram_id,
    admin: object?.is_admin,
    valid,
    workingDays: [],
  }

  if (worker) {
    const doc = google()

    await doc.loadInfo()
    const sheet = doc.sheetsByIndex[0]
    const rows = await sheet.getRows()

    const row = rows.find(
      (row: {_rawData: string[]}) =>
        row._rawData[2]?.split(' ')[0] === worker.name,
    )

    await sheet.loadHeaderRow()
    const headerValues = sheet.headerValues
      .slice(9, 23)
      .map((value: string) => value.split(' ')[1])

    if (row) {
      const workerIndex = rows.indexOf(row)
      const rowIndex = workerIndex + 2

      await sheet.loadCells(`J${rowIndex}:W${rowIndex}`)

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

      const formattedDates = headerValues?.map(
        (date: string, index: number) => {
          return {date, key: keys[index]}
        },
      )

      formattedDates?.forEach(async (day: {date: string; key: any}) => {
        const cell = sheet.getCellByA1(`${day.key}${rowIndex}`)

        const object = {date: day.date, value: '', location: ''}

        if (cell.value === 'Могу') {
          object.value = '+'
        } else if (cell.value) {
          const location = getLocation(cell.value)
          object.location = location
          object.value = '+'
        } else if (compareObjects(cell.backgroundColor, {red: 1})) {
          object.value = '-'
        } else if (compareObjects(cell.backgroundColor, {red: 1, green: 1})) {
          object.value = '+/-'
        } else {
          return
        }

        // @ts-ignore
        worker.workingDays.push(object)
      })
    }
  }

  return NextResponse.json(object ? worker : {valid})
}
