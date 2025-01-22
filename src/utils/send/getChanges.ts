import {
  GoogleSpreadsheetRow,
  GoogleSpreadsheetWorksheet,
} from 'google-spreadsheet'
import {Day} from '../types'
import {CellBGColorStyle, Change, Comment} from './types'
import getCellValue from './getCellValue'
import getComments from './getComments'
import locations from '../locations'
import conn from '@/lib/database'

interface Options {
  sheet: GoogleSpreadsheetWorksheet
  row: GoogleSpreadsheetRow
  selectedDays: Day[]
  workerName: string
}

const valuesMap: {[key: string]: string} = {
  '+': 'Могу',
  '-': 'Не могу',
  '+/-': 'Могу с огр-ем'
}

export default async function getChanges({sheet, row, selectedDays, workerName}: Options) {
  const headerValues = sheet.headerValues
  const rowNumber = row.rowNumber

  const changes: Change[] = []
  const commentsChanges: Comment[] = []
  const queries: string[] = []

  await sheet.loadCells(`F${rowNumber}:W${rowNumber}`)
  
  const comments = await getComments(workerName)

  headerValues.slice(9, 23).forEach((headerValue: string) => {
    const date = headerValue.split(' ')[1]
    const day = selectedDays.find(day => day.date === date)

    if (!day?.value) return

    const colNumber = headerValues.indexOf(headerValue)

    const cell = sheet.getCell(rowNumber - 1, colNumber)
    const currentValue = cell.stringValue
    const currentBGColor = cell.effectiveFormat
      ?.backgroundColorStyle as CellBGColorStyle

    const cellValue = getCellValue(currentValue, currentBGColor)
    const comment = comments.find((comment) => comment.date === date)
    const commentValue = comment?.value || ''
    const dayComment = day.comment || ''
    const cellNote = cell.note || ''
    const isDifferentComment = commentValue !== cellNote || commentValue !== dayComment
    
    if (day.value === cellValue.value && !isDifferentComment) return

    if(isDifferentComment && day.comment) {
      cell.note = day?.comment || ''
      commentsChanges.push({date, value: day?.comment || ''})
    }

    const providedLocation = locations.find(l => l.toLowerCase() === day.value?.toLowerCase())
    const hasLocation = locations.includes(cellValue.effectiveValue || '')

      const shouldSkip = hasLocation && ['+', '+/-'].includes(day.value)

    if (providedLocation) {
        cell.stringValue = providedLocation
    } else if (valuesMap[day.value] && !shouldSkip) {
        cell.stringValue = valuesMap[day.value]
    }
    
    changes.push({date, newValue: day.value, comment: day?.comment || '', location:
      hasLocation && 
        (day.value === '-' || day.value === '+/-') ? cellValue.effectiveValue : ''
      })

      conn.query(`SELECT s.location_id FROM lt_arena.schedule s
    LEFT JOIN lt_arena.workers w ON LOWER(w.name) = '${workerName.toLowerCase()}'
    WHERE s.worker_id = w.id AND s.date = '${date}'`
      ).then((rawData) => {
        const currentSchedule = rawData.rows || []

        const condition = currentSchedule.length && currentSchedule?.find(obj => obj.location_id === 0 || obj.location_id === null)

        const query = `INSERT INTO lt_arena.schedule (worker_id, location_id, date, value, comment)
        SELECT w.id AS worker_id,
          COALESCE(${condition ? 0 : 'l.id'}, 0) AS location_id,
          '${date}' AS date,
          '${day?.value}' AS value,
          '${day?.comment || ''}' AS comment
        FROM lt_arena.workers w
        LEFT JOIN lt_arena.locations l ON LOWER(l.name)='${day.location?.toLowerCase() || 'NULL'}'
          WHERE LOWER(w.name)='${workerName.toLowerCase()}'
        ON CONFLICT (worker_id, date, location_id)
          DO UPDATE SET
          value=EXCLUDED.value,
          comment=EXCLUDED.comment,
          location_id=COALESCE((SELECT l.id FROM lt_arena.locations l WHERE LOWER(l.name) = '${day.location?.toLowerCase() || 'NULL'}' LIMIT 1), 0)
          WHERE lt_arena.schedule.date=EXCLUDED.date
          AND lt_arena.schedule.worker_id=EXCLUDED.worker_id`

      queries.push(query)
      })

  })

  return {changes, commentsChanges, queries}
}
