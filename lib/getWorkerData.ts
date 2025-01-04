import google from '@/lib/google'
import compareObjects from '../src/utils/compareObjects'
import {LocationData, WorkingDay} from '@/src/utils/types'
import getLocationData from './getLocationData'
import locations from '@/src/utils/locations'
import { GoogleSpreadsheetRow } from 'google-spreadsheet'

interface FormattedDate {
  date: string
  key: string
}

interface WorkerData {
  workingDays: WorkingDay[]
  type: string
  isAdmin: boolean
  location?: string
}

interface DayData {
  date: string
  value: string
  location: string
  locationData: LocationData[]
}

const BACKGROUND_COLORS = {
  red: {red: 0.878, green: 0.4, blue: 0.4},
  darkRed: {red: 0.6},
  yellow: {red: 1, green: 0.949, blue: 0.8},
  darkYellow: {red: 1, green: 0.898, blue: 0.6},
  black: {},
}

const EXCLUDED_LOCATIONS = ['Не могу', 'Отпуск', 'Больничный', '???']

const ADMIN_RANKS = [
  'главный инженер по эксплуатации и ремонту',
  'советник',
  'платиновый',
  'золотой',
]

export default async function getWorkerData(worker: any): Promise<WorkerData> {
  const doc = google()
  await doc.schedule.loadInfo()

  const sheet = doc.schedule.sheetsByTitle['Сотрудники + расписание']
  const locationsSheet = doc.schedule.sheetsByTitle['Расписание по площадкам']
  
  const rows = await sheet.getRows()
  await sheet.loadHeaderRow(7)
  const row = rows.find(
    (r: GoogleSpreadsheetRow) =>
      r.get('Позывной')?.split('-')[0].trim()?.toLowerCase() ===
      worker?.name?.toLowerCase(),
  )

  if (!row) return {workingDays: [], type: '', isAdmin: false}

  const rowIndex = row.rowNumber

  await Promise.all([
    locationsSheet.loadHeaderRow(2),
    sheet.loadCells(`E${rowIndex}:X${rowIndex}`),
  ])
  
  const locationsRows = await locationsSheet.getRows()

  const headerValues = sheet.headerValues
    .slice(9, 23)
    .map((value: string) => value.split(' ')[1])
  const keys = 'JKLMNOPQRSTUVWX'.split('')

  const formattedDates: FormattedDate[] = headerValues.map(
    (date: string, index: number) => ({
      date,
      key: keys[index],
    }),
  )

  const location = sheet.getCellByA1(`E${row.rowNumber}`).value
  const rank = row.get('Ранг')

  const dataPromises = formattedDates.map(async ({date, key}) => {
    const cell = sheet.getCellByA1(`${key}${rowIndex}`)
    const backgroundColor = cell.effectiveFormat?.backgroundColor

    if (cell.note?.split(' ')[0] < date) {
      cell.note = ''
    }

    const dayData: DayData = {
      date,
      value: '',
      location: '',
      locationData: [],
    }

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
      compareObjects(backgroundColor, BACKGROUND_COLORS.black) ||
      cell.value === 'Не могу'
    ) {
      dayData.value = '-'
    }

    const locationData =
      (await getLocationData(
        date,
        dayData.location,
        locationsSheet,
        rows,
        locationsRows,
        worker?.name || '',
      )) || []

    if (locationData?.length) {
      dayData.locationData = locationData
    }

    return dayData
  })

  const workingDays: WorkingDay[] = await Promise.all(dataPromises)

  await sheet.saveUpdatedCells().catch(() => {})

  const isAdmin = ADMIN_RANKS.includes(rank?.trim()?.toLowerCase())

  const workerData: WorkerData = {
    workingDays,
    type: rank ? 'worker' : 'actor',
    isAdmin,
  }

  if (
    isAdmin &&
    locations.find(l => l.toLowerCase() === location?.toLowerCase())
  ) {
    workerData.location = location
  }

  return workerData
}
