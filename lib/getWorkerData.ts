import google from '@/lib/google'
import compareObjects from '../src/utils/compareObjects'
import {WorkingDay} from '@/src/utils/types'

interface FormattedDate {
  date: string
  key: string
}

interface WorkerData {
  workingDays: WorkingDay[]
  type: string
}

const BACKGROUND_COLORS = {
  red: {red: 0.878, green: 0.4, blue: 0.4},
  darkRed: {red: 0.6},
  yellow: {red: 1, green: 0.949, blue: 0.8},
  darkYellow: {red: 1, green: 0.898, blue: 0.6},
}

const EXCLUDED_LOCATIONS = ['Не могу', 'Отпуск', 'Больничный']

export default async function getWorkerData(worker: any): Promise<WorkerData> {
  const doc = google()
  await doc.loadInfo()

  const sheet = doc.sheetsByIndex[0]
  const rows = await sheet.getRows()
  const row = rows.find(
    (r: {_rawData: string[]}) =>
      r._rawData[2]?.split('-')[0].trim().toLowerCase() ===
      worker?.name?.toLowerCase(),
  )

  if (!row) return {workingDays: [], type: ''}

  const rowIndex = row.rowNumber

  await Promise.all([
    sheet.loadHeaderRow(7),
    sheet.loadCells(`F${rowIndex}:W${rowIndex}`),
  ])

  const headerValues = sheet.headerValues
    .slice(9, 23)
    .map((value: string) => value.split(' ')[1])
  const keys = 'JKLMNOPQRSTUVW'.split('')

  const formattedDates: FormattedDate[] = headerValues.map(
    (date: string, index: number) => ({
      date,
      key: keys[index],
    }),
  )

  const rank = sheet.getCellByA1(`F${row.rowNumber}`).value

  const workingDays: WorkingDay[] = formattedDates.map(({date, key}) => {
    const cell = sheet.getCellByA1(`${key}${rowIndex}`)
    const backgroundColor = cell.effectiveFormat.backgroundColor

    if (cell.note?.split(' ')[0] < date) {
      cell.note = ''
    }

    const dayData = {date, value: '', location: ''}

    if (cell.value === 'Могу') {
      dayData.value = '+'
    } else if (
      compareObjects(backgroundColor, BACKGROUND_COLORS.yellow) ||
      compareObjects(backgroundColor, BACKGROUND_COLORS.darkYellow) ||
      cell.value === 'Могу с огр-ем'
    ) {
      dayData.value = '+/-'
    } else if (cell.value && !EXCLUDED_LOCATIONS.includes(cell.value)) {
      dayData.location = cell.value
      dayData.value = '+'
    } else if (
      compareObjects(backgroundColor, BACKGROUND_COLORS.red) ||
      compareObjects(backgroundColor, BACKGROUND_COLORS.darkRed) ||
      cell.value === 'Не могу'
    ) {
      dayData.value = '-'
    }

    return dayData
  })

  await sheet.saveUpdatedCells().catch(() => {})

  const workerData: WorkerData = {
    workingDays,
    type: rank ? 'worker' : 'actor',
  }

  return workerData
}
