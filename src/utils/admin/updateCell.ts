import {
  GoogleSpreadsheetRow,
  GoogleSpreadsheetWorksheet,
} from 'google-spreadsheet'
import hexToRgb from '../hextToRgb'
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
  coloumnIndex: number,
  data: WorkerSalary,
  workerData: WorkerData,
) {
  console.debug(data, workerData)

  const rowIndex = row.rowNumber - 1

  await sheet.loadCells({
    startRowIndex: rowIndex,
    endRowIndex: rowIndex + 5,
    startColumnIndex: coloumnIndex,
    endColumnIndex: coloumnIndex + 2,
  })

  const locationColor = hexToRgb(locationsColors[data.location])

  Object.keys(locationColor).forEach(key => {
    if (key !== 'blue' && key !== 'green' && key !== 'red') return

    locationColor[key] = locationColor[key] / 255
  })

  let salary = ranksSalary[workerData.rank].default

  const locationCell = sheet.getCell(rowIndex, coloumnIndex)
  locationCell.value = data.location

  const timeCell = sheet.getCell(rowIndex + 1, coloumnIndex)
  const workingSalaryCell = sheet.getCell(rowIndex + 1, coloumnIndex + 1)

  const overWorkTimeCell = sheet.getCell(rowIndex + 2, coloumnIndex)
  const overWorkSalaryCell = sheet.getCell(rowIndex + 2, coloumnIndex + 1)

  timeCell.value = workerData.calculatedWorkingTime

  if (data.comment?.toLowerCase().includes('под игру')) {
    salary = 1500
  }

  workingSalaryCell.value = ranksSalary[workerData.rank].default

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

  if (data.bonuses) {
    const bonusesCell = sheet.getCell(rowIndex + 3, coloumnIndex + 1)
    bonusesCell.formula = `=${data.bonuses}`
    bonusesCell.backgroundColor = locationColor
  }

  if (data.comment) {
    const commentsCell = sheet.getCell(rowIndex + 4, coloumnIndex)
    commentsCell.value = data.comment
    commentsCell.backgroundColor = locationColor
  }

  const emptyCell = sheet.getCell(rowIndex + 3, coloumnIndex)

  locationCell.backgroundColor = locationColor
  timeCell.backgroundColor = locationColor
  workingSalaryCell.backgroundColor = locationColor
  overWorkTimeCell.backgroundColor = locationColor
  overWorkSalaryCell.backgroundColor = locationColor
  emptyCell.backgroundColor = locationColor
}
