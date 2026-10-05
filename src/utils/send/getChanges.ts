import {
  GoogleSpreadsheetRow,
  GoogleSpreadsheetWorksheet,
} from 'google-spreadsheet'
import {Day} from '../types'
import {CellBGColorStyle, Change} from './types'
import getCellValue from './getCellValue'
import getLocations from '@/lib/functions/getLocations'
import db from '@/lib/database'

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

  const changes: Change[] = []
  const queries: {text: string; values: unknown[]}[] = []

  const lastColumnLetter = sheet.lastColumnLetter

  await sheet.loadCells(`G${rowNumber}:${lastColumnLetter}${rowNumber}`)

  const comments = (
    await db.query(
      `select date, comment
       from schedule.list
       where worker_id = (select id from workers where lower(name) = lower($1))
       order by date`,
      [workerName],
    )
  ).rows
  const locations = await getLocations()

  for (const headerValue of headerValues.slice(10)) {
    const date = headerValue.split(' ')[1]
    const day = selectedDays.find(day => day.date?.toFormat('dd.MM') === date)

    if (!(day?.value && day.date)) continue

    const colNumber = headerValues.indexOf(headerValue)

    const cell = sheet.getCell(rowNumber - 1, colNumber)
    const currentValue = cell.stringValue
    const currentBGColor = cell.effectiveFormat
      ?.backgroundColorStyle as CellBGColorStyle

    const cellValue = await getCellValue(currentValue, currentBGColor)
    const comment = comments.find(
      comment => comment.date.toFormat('dd.MM') === date,
    )
    const commentValue = comment?.value || ''
    const dayComment = day.comment || ''
    const cellNote = cell.note || ''
    const isDifferentComment =
      commentValue !== cellNote || commentValue !== dayComment

    if (isDifferentComment && day.comment) {
      cell.note = day?.comment || ''
    }

    const providedLocation = locations.find(
      l => l.name.toLowerCase() === day.value?.toLowerCase(),
    )

    const hasLocation = locations.find(
      l => l.name?.toLowerCase() === cellValue.effectiveValue?.toLowerCase(),
    )

    const shouldSkip = hasLocation && ['+', '+/-'].includes(day.value)

    if (providedLocation) {
      cell.stringValue = providedLocation.name
    } else if (valuesMap[day.value] && !shouldSkip) {
      cell.stringValue = valuesMap[day.value]
    }

    changes.push({
      date: day.date,
      newValue: day.value,
      comment: day?.comment || '',
      location:
        hasLocation && (day.value === '-' || day.value === '+/-')
          ? cellValue.effectiveValue
          : '',
    })

    const formattedDate = day.date?.toFormat('yyyy-MM-dd')

    const query = {
      text: `INSERT INTO schedule.list (worker_id, date, value, comment)
        SELECT w.id AS worker_id,
          $1::date AS date,
          $2::text AS value,
          $3::text AS comment
        FROM workers w
          WHERE LOWER(w.name) = LOWER($4)
        ON CONFLICT (worker_id, date)
          DO UPDATE SET
          value=EXCLUDED.value,
          comment=EXCLUDED.comment
          WHERE schedule.list.date=EXCLUDED.date
          AND schedule.list.worker_id=EXCLUDED.worker_id
          AND schedule.list.date = EXCLUDED.date`,
      values: [formattedDate, day.value, day.comment || '', workerName],
    }

    queries.push(query)
  }

  return {changes, queries}
}
