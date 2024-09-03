import google from '@/lib/google'
import getLocation from '../src/utils/getLocation'
import compareObjects from '../src/utils/compareObjects'

export default async function getWorkerData(worker: any) {
  const doc = google()

  await doc.loadInfo()

  const sheet = doc.sheetsByIndex[0]
  const rows = await sheet.getRows()

  const row = rows.find(
    (row: {_rawData: string[]}) =>
      row._rawData[2]?.split(' ')[0].toLowerCase() ===
      worker?.name?.toLowerCase(),
  )

  if (!row) return []

  const workerIndex = rows.indexOf(row)
  const rowIndex = workerIndex + 2

  await Promise.all([
    sheet.loadHeaderRow(),
    sheet.loadCells(`J${rowIndex}:W${rowIndex}`),
  ])

  const keys = 'JKLMNOPQRSTUVW'.split('')

  const headerValues = sheet.headerValues
    .slice(9, 23)
    .map((value: string) => value.split(' ')[1])

  const formattedDates = headerValues.map((date: string, index: number) => ({
    date,
    key: keys[index],
  }))

  const workingDays = formattedDates.map((day: {date: string; key: any}) => {
    const cell = sheet.getCellByA1(`${day.key}${rowIndex}`)

    const object = {date: day.date, value: '', location: {}}

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
    }

    return object
  })

  return workingDays
}
