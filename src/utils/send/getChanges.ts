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
  '+/-': 'Могу с огр-ем'
}

export default async function getChanges({sheet, row, selectedDays, workerName}: Options) {
  const headerValues = sheet.headerValues
  const rowNumber = row.rowNumber

  const changes: Change[] = []
  const commentsChanges: Comment[] = []

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
  })

  return {changes, commentsChanges}
}
