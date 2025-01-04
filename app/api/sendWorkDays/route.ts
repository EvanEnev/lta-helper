import {evaluate} from 'mathjs'
import google from '@/lib/google'
import validateData from '@/lib/validateData'
import updateCells from '@/src/utils/admin/updateCell'
import ranksSalary from '@/src/utils/ranksSalary'
import { WorkerSalary } from '@/src/utils/types'
import {GoogleSpreadsheetRow, GoogleSpreadsheetWorksheet} from 'google-spreadsheet'
import {NextRequest, NextResponse} from 'next/server'


const ADMIN_RANKS = ['платиновый', 'золотой']

const getWorkerRow = (workerName: string, rows: GoogleSpreadsheetRow[]) => {
  return rows.find(
    // @ts-ignore
    (row: GoogleSpreadsheetRow) => row._rawData[0]?.split('-')[0]?.trim() === workerName.trim(),
  )
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const user = await validateData(body?.initData)
  const worker = body.worker

  const salaryData: WorkerSalary[] = body.salaryData
  const date = body.date

  if (!user) {
    return NextResponse.json({message: 'Ошибка валидации'}, {status: 500})
  }

  const doc = await google()

  await doc.actors.loadInfo()
  await doc.workers.loadInfo()
  await doc.schedule.loadInfo()

  const workersSheet: GoogleSpreadsheetWorksheet = doc.workers.sheetsByIndex[0]
  const actorsSheet: GoogleSpreadsheetWorksheet = doc.actors.sheetsByIndex[0]
  const scheduleSheet = doc.schedule.sheetsByTitle['Сотрудники + расписание']

  await Promise.all([workersSheet.loadHeaderRow(), actorsSheet.loadHeaderRow(), scheduleSheet.loadHeaderRow(7)])

  const workersRows: GoogleSpreadsheetRow[] = await workersSheet.getRows()
  const actorsRows: GoogleSpreadsheetRow[] = await actorsSheet.getRows()
  const scheduleRows: GoogleSpreadsheetRow[] = await scheduleSheet.getRows()

  const workerRow = scheduleRows.find((row: GoogleSpreadsheetRow) => row.get('Позывной')?.split('-')[0]?.trim()?.toLowerCase() === worker?.name?.toLowerCase())

  if (!ADMIN_RANKS.includes(workerRow?.get('Ранг').toLowerCase())) return NextResponse.json({})
  
  salaryData.forEach(async (data) => {
    const workerRow = getWorkerRow(data.worker, workersRows)
    const actorRow = getWorkerRow(data.worker, actorsRows)
  
    const scheduleRow = scheduleRows.find((row: GoogleSpreadsheetRow) => row.get('Позывной')?.split('-')[0]?.trim()?.toLowerCase() === data.worker.toLowerCase())

    const rank: string = scheduleRow?.get('Ранг')?.toLowerCase() || 'актёр'
    const dateColoumnNumber = workersSheet.headerValues.findIndex((value: string) => value.split(' ')[0] === date)
    const gamesCount = data.gamesCount || 1
    
    let workingTimeParts: string[] | number[] = data.workingHours.split('-')
    if(workingTimeParts.length < 2) return

    workingTimeParts = workingTimeParts.map(v => parseInt(v))

    if(workingTimeParts[1] < 12) {
      workingTimeParts[1] += 24
    }

    const workingTime = workingTimeParts[1] - workingTimeParts[0]

    const overWorkTime = workingTime - (data.isHardTime ? 8 : 9)
    const isOverWork = overWorkTime > 0 && rank !== 'актёр'

    let calculatedWorkingTime = ''
    let calculatedOverWorkTime = ''

    if (data.isHardTime && isOverWork) {
      calculatedWorkingTime = `${workingTimeParts[0]}-${workingTimeParts[0] + 8}`
      calculatedOverWorkTime = `${workingTimeParts[0] + 8}-${workingTimeParts[0] + 8 + overWorkTime}`
    } else if (isOverWork) {
      calculatedWorkingTime = `${workingTimeParts[0]}-${workingTimeParts[0] + 9}`
      calculatedOverWorkTime = `${workingTimeParts[0] + 9}-${workingTimeParts[0] + 9 + overWorkTime}`
    } else {
      calculatedWorkingTime = `${workingTimeParts[0]}-${workingTimeParts[1]}`
    }

    const workerInfoData = {rank, calculatedWorkingTime, isOverWork, calculatedOverWorkTime, overWorkTime, gamesCount}

    if (workerRow) {
      await updateCells(workersSheet, workerRow, dateColoumnNumber, data, workerInfoData)
    } else if (actorRow) {
      await updateCells(workersSheet, actorRow, dateColoumnNumber, data, workerInfoData)
    } else {
      let salary = ranksSalary[rank].default
      let message = `${date} ${data.location}\n\n${rank} | ${data.worker}\n\n${calculatedWorkingTime} ${ranksSalary[rank].default}`

      if (rank === 'актёр' && data.gamesCount && data.gamesCount > 2) {
         message +=  `\n${ranksSalary[rank].overWork * (data.gamesCount - 2)} (${ranksSalary[rank].overWork} * ${data.gamesCount -2})`
         salary += ranksSalary[rank].overWork * (data.gamesCount - 2)
      }

      if (isOverWork) {
        message += `\n${calculatedOverWorkTime} ${ranksSalary[rank].overWork * overWorkTime}`
        salary += ranksSalary[rank].overWork * overWorkTime
      }

      if (data.comment) {
        message += `\n\n${data.comment}`
      }

      if (data.bonuses) {
        message += `\n\nБонусы: ${data.bonuses} ${evaluate(data.bonuses)}`
        salary += evaluate(data.bonuses)
      }

      message += `\n\nИтог: ${salary}\n\nНет в графике ${rank === 'актёр' ? 'актёров' : 'персонала'} 2025`

      console.log(message)
    }
})

  await workersSheet.saveUpdatedCells()
  await actorsSheet.saveUpdatedCells()
  return NextResponse.json({})
}
