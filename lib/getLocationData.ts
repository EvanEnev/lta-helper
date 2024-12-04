import getLocation from '@/lib/getLocation'
import google from '@/lib/google'
import {
  GoogleSpreadsheetRow,
  GoogleSpreadsheetWorksheet,
} from 'google-spreadsheet'
import convertDate from '@/lib/convertDate'
import getWorkerRow from './getWorkerRow'
import {LocationData} from '@/src/utils/types'

export default async function getLocationData(
  dateString: string,
  locationName: string,
  sheet: GoogleSpreadsheetWorksheet,
  workersRows: GoogleSpreadsheetRow[],
  rows: GoogleSpreadsheetRow[],
  workerName: string,
) {
  const location = getLocation(locationName)

  if (!location) return []
  if (!workerName) return []

  const doc = google()
  await doc.loadInfo()

  const [day, month] = dateString.split('.').map(value => parseInt(value))

  const date: any = new Date(2024, month - 1, day, 0, 0, 0, 0)

  const locationIndex = sheet.headerValues.findIndex(
    (value: string) => value.toLowerCase() === location.toLowerCase(),
  )

  const dateRowIndex = rows.findIndex(
    row =>
      convertDate(row.get(location.toUpperCase())).toString() ===
      date.toString(),
  )

  if (!locationIndex || dateRowIndex === -1) return []

  // @ts-ignore
  const hasRoles = rows[dateRowIndex + 5]._rawData[locationIndex + 1]
    .toLowerCase()
    .includes('роль')

  const timesOffset = hasRoles ? 2 : 1

  const locationData: LocationData[] = []

  for (let i = 6; i <= 9; i++) {
    // @ts-ignore
    const row = rows[dateRowIndex + i]._rawData

    const workers = row[locationIndex].split('\n')
    const times = row[locationIndex + timesOffset].split('\n')
    const roles = hasRoles ? row[locationIndex + 1].split('\n') : []

    workers.forEach((worker: string, index: number) => {
      if (!worker || worker.toLocaleLowerCase().includes('закрыто')) return
      const role = roles[index]

      const workerRow = getWorkerRow(worker, workersRows)

      const isTrainee =
        worker.toLowerCase().includes('стажёр') ||
        worker.toLowerCase().includes('стажер')

      let rank = workerRow?.get('Ранг')

      const timeParts = times[index]?.split('-') || []
      const hours = timeParts[0] || '00'
      const minutes = timeParts[1] || '00'

      console.log(timeParts)
      const time =
        hours === '00' && minutes === '00'
          ? 'Не указано'
          : `${hours.includes(':') ? hours : hours + ':00'}−${
              minutes.includes(':') ? minutes : minutes + ':00'
            }`

      if (!rank) {
        rank = isTrainee ? 'Стажёр' : 'Актёр'
        if (isTrainee) {
          worker = worker.split(' ')[1]
        }
      }

      const data = {
        time: time === '00:00-00:00' ? 'Не указано' : time,
        role: role || '',
        worker: worker,
        rank: rank,
      }

      const self = worker.toLowerCase() === workerName.toLowerCase()
      locationData.push({data, self})
    })
  }

  return locationData
}
