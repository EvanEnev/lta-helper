import google from '@/lib/google'
import compareObjects from '../src/utils/compareObjects'

const redBackgoundColor = {
  red: 0.8784314,
  green: 0.4,
  blue: 0.4,
}

const darkRedBackgoundColor = {red: 0.6}

const yellowBackgoundColor = {
  red: 1,
  green: 0.8980392,
  blue: 0.6,
}

const darkYellowBackgoundColor = {red: 1, green: 1, blue: 1}

const excludedLocation = ['Не могу', 'Отпуск', 'Больничный']

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

  const rowIndex = row.rowNumber

  await Promise.all([
    sheet.loadHeaderRow(7),
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
    const backgroundColor = cell.backgroundColor

    const object = {date: day.date, value: '', location: ''}

    if (cell.value === 'Могу') {
      object.value = '+'
    } else if (cell.value && !excludedLocation.includes(cell.value)) {
      object.location = cell.value
      object.value = '+'
    } else if (
      compareObjects(backgroundColor, redBackgoundColor) ||
      compareObjects(backgroundColor, darkRedBackgoundColor)
    ) {
      object.value = '-'
    } else if (
      compareObjects(backgroundColor, yellowBackgoundColor) ||
      compareObjects(backgroundColor, darkYellowBackgoundColor)
    ) {
      object.value = '+/-'
    }

    return object
  })

  return workingDays
}
