import {
  GoogleSpreadsheetRow,
  GoogleSpreadsheetWorksheet,
} from 'google-spreadsheet'
import {Day} from '../types'
import {CellBGColorStyle} from './types'
import locations from '../locations'

interface Options {
  sheet: GoogleSpreadsheetWorksheet
  row: GoogleSpreadsheetRow
  selectedDays: Day[]
}

export default async function getChanges({sheet, row, selectedDays}: Options) {
  const headerValues = sheet.headerValues

  const rowNumber = row.rowNumber

  await sheet.loadCells(`F${rowNumber}:W${rowNumber}`)

  headerValues.slice(9, 23).forEach((headerValue: string) => {
    const date = headerValue.split(' ')[1]
    const day = selectedDays.find(day => day.date === date)

    if (!day?.value) return

    const colNumber = headerValues.indexOf(headerValue)

    const cell = sheet.getCell(rowNumber - 1, colNumber)
    const currentValue = cell.stringValue
    const currentBGColor = cell.effectiveFormat
      ?.backgroundColorStyle as CellBGColorStyle

    const rgbColor = currentBGColor?.rgbColor
    const hasLocation = locations.find(
      l => l.toLowerCase() === currentValue?.toLowerCase(),
    )
  })
}
