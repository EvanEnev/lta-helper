import {
  GoogleSpreadsheetRow,
  GoogleSpreadsheetWorksheet,
} from 'google-spreadsheet'
import {Day} from '../types'
import {CellBGColorStyle, Change, Comment} from './types'
import getCellValue from './getCellValue'
import getComments from './getComments'
import locations from '../locations'

interface Options {
  sheet: GoogleSpreadsheetWorksheet
  row: GoogleSpreadsheetRow
  selectedDays: Day[]
  workerName: string
}

const valuesMap: {[key: string]: string} = {
  '+': 'Могу',
  '-': 'Не могу',
  '+/-': 'Могу с огр-ем',
}

export default async function getChanges({
  sheet,
  row,
  selectedDays,
  workerName,
}: Options) {
  const headerValues = sheet.headerValues
  const rowNumber = row.rowNumber
  selectedDays = selectedDays.map(day => ({
    ...day,
    date: new Date(day?.date || ''),
  }))

  const changes: Change[] = []
  const commentsChanges: Comment[] = []
  const queries: string[] = []

  const lastColumnLetter = sheet.lastColumnLetter

  await sheet.loadCells(`G${rowNumber}:${lastColumnLetter}${rowNumber}`)

  const comments = await getComments(workerName)

  headerValues.slice(10).forEach((headerValue: string) => {
    const date = headerValue.split(' ')[1]
    const day = selectedDays.find(
      day =>
        day.date?.toLocaleDateString('ru-RU', {
          month: 'numeric',
          day: 'numeric',
        }) === date,
    )

    if (!day?.value) return

    const colNumber = headerValues.indexOf(headerValue)

    const cell = sheet.getCell(rowNumber - 1, colNumber)
    const currentValue = cell.stringValue
    const currentBGColor = cell.effectiveFormat
      ?.backgroundColorStyle as CellBGColorStyle

    const cellValue = getCellValue(currentValue, currentBGColor)
    const comment = comments.find(comment => comment.date === date)
    const commentValue = comment?.value || ''
    const dayComment = day.comment || ''
    const cellNote = cell.note || ''
    const isDifferentComment =
      commentValue !== cellNote || commentValue !== dayComment

    if (isDifferentComment && day.comment) {
      cell.note = day?.comment || ''
      commentsChanges.push({date, value: day?.comment || ''})
    }

    const providedLocation = locations.find(
      l => l.toLowerCase() === day.value?.toLowerCase(),
    )
    const hasLocation = locations.includes(cellValue.effectiveValue || '')

    const shouldSkip = hasLocation && ['+', '+/-'].includes(day.value)

    if (providedLocation) {
      cell.stringValue = providedLocation
    } else if (valuesMap[day.value] && !shouldSkip) {
      cell.stringValue = valuesMap[day.value]
    }

    changes.push({
      date,
      newValue: day.value,
      comment: day?.comment || '',
      location:
        hasLocation && (day.value === '-' || day.value === '+/-')
          ? cellValue.effectiveValue
          : '',
    })

    const year = day.date?.getFullYear().toString()
    const month = ((day?.date?.getMonth() || 0) + 1).toString().padStart(2, '0')
    const dayString = day.date?.getDate().toString().padStart(2, '0')
    const formattedDate = `${year}-${month}-${dayString}`

    const query = `INSERT INTO lt_arena.schedule (worker_id, date, value, comment)
        SELECT w.id AS worker_id,
          '${formattedDate}' AS date,
          '${day?.value}' AS value,
          '${day?.comment || ''}' AS comment
        FROM lt_arena.workers w
        LEFT JOIN lt_arena.locations l ON LOWER(l.name)='${
          day.location?.toLowerCase() || 0
        }'
          WHERE LOWER(w.name)='${workerName.toLowerCase()}'
        ON CONFLICT (worker_id, date)
          DO UPDATE SET
          value=EXCLUDED.value,
          comment=EXCLUDED.comment
          WHERE lt_arena.schedule.date=EXCLUDED.date
          AND lt_arena.schedule.worker_id=EXCLUDED.worker_id
          AND lt_arena.schedule.date = EXCLUDED.date`

    queries.push(query)
  })

  return {changes, commentsChanges, queries}
}
