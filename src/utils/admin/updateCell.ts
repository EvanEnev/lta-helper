import {
  GoogleSpreadsheetRow,
  GoogleSpreadsheetWorksheet,
} from 'google-spreadsheet'
import hexToRgb from '../../../lib/functions/hextToRgb'
import locationsColors from '../locationsColors'
import ranksSalary from '../ranksSalary'
import {WorkerSalary} from '../types'

type WorkerData = {
  rank: string
  calculatedWorkingTime: string
  isOverWork: boolean
  calculatedOverWorkTime: string
  overWorkTime: number
  gamesCount?: number
}

export default async function updateCells(
  sheet: GoogleSpreadsheetWorksheet,
  row: GoogleSpreadsheetRow,
  columnIndex: number,
  data: WorkerSalary,
  workerData: WorkerData,
) {
  const rowIndex = row.rowNumber - 1

  console.log(
    data,
    workerData,
    `rowIndex: ${rowIndex}`,
    `columnIndex: ${columnIndex}`,
  )

  await sheet.loadCells({
    startRowIndex: rowIndex,
    endRowIndex: rowIndex + 5,
    startColumnIndex: columnIndex,
    endColumnIndex: columnIndex + 2,
  })

  const locationColor = hexToRgb(locationsColors[data.location])

  Object.keys(locationColor).forEach(key => {
    if (key !== 'blue' && key !== 'green' && key !== 'red') return

    locationColor[key] = locationColor[key] / 255
  })

  let salary = ranksSalary[workerData.rank].default

  const locationCell = sheet.getCell(rowIndex, columnIndex)
  locationCell.value = data.location

  console.log(locationCell.a1Address)
  const timeCell = sheet.getCell(rowIndex + 1, columnIndex)
  const workingSalaryCell = sheet.getCell(rowIndex + 1, columnIndex + 1)

  const overWorkTimeCell = sheet.getCell(rowIndex + 2, columnIndex)
  const overWorkSalaryCell = sheet.getCell(rowIndex + 2, columnIndex + 1)

  timeCell.value = workerData.calculatedWorkingTime

  if (data.comment?.toLowerCase().includes('под игру')) {
    salary = 1500
  }

  workingSalaryCell.formula = `=${salary}`

  if (workerData.isOverWork) {
    overWorkTimeCell.value = workerData.calculatedOverWorkTime
    overWorkSalaryCell.formula = `=${
      ranksSalary[workerData.rank].overWork || 0
    } * ${workerData.overWorkTime}`
  }

  if (
    workerData.rank === 'актёр' &&
    workerData.gamesCount &&
    workerData.gamesCount > 2
  ) {
    overWorkSalaryCell.formula = `=${
      ranksSalary[workerData.rank].overWork || 0
    } * ${workerData.gamesCount - 2}`
  }

  const bonusesCell = sheet.getCell(rowIndex + 3, columnIndex + 1)

  if (data.bonuses) {
    bonusesCell.formula = `=${data.bonuses}`
  }

  const commentsCell = sheet.getCell(rowIndex + 4, columnIndex)

  if (data.comment) {
    commentsCell.value = data.comment
  }

  const emptyCell = sheet.getCell(rowIndex + 3, columnIndex)

  locationCell.horizontalAlignment = 'CENTER'
  locationCell.verticalAlignment = 'MIDDLE'

  timeCell.horizontalAlignment = 'LEFT'
  timeCell.verticalAlignment = 'MIDDLE'

  workingSalaryCell.horizontalAlignment = 'RIGHT'
  workingSalaryCell.verticalAlignment = 'MIDDLE'

  overWorkTimeCell.horizontalAlignment = 'LEFT'
  overWorkTimeCell.verticalAlignment = 'MIDDLE'

  overWorkSalaryCell.horizontalAlignment = 'RIGHT'
  overWorkSalaryCell.verticalAlignment = 'MIDDLE'

  bonusesCell.horizontalAlignment = 'RIGHT'
  bonusesCell.verticalAlignment = 'MIDDLE'

  commentsCell.horizontalAlignment = 'CENTER'
  commentsCell.verticalAlignment = 'MIDDLE'

  locationCell.backgroundColor = locationColor
  timeCell.backgroundColor = locationColor
  workingSalaryCell.backgroundColor = locationColor
  overWorkTimeCell.backgroundColor = locationColor
  overWorkSalaryCell.backgroundColor = locationColor
  emptyCell.backgroundColor = locationColor
  bonusesCell.backgroundColor = locationColor
  commentsCell.backgroundColor = locationColor

  return true
}
