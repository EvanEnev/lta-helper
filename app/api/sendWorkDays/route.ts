import {evaluate} from 'mathjs'
import google, {GoogleDocument} from '@/lib/google'
import updateCells from '@/src/utils/admin/updateCell'
import ranksSalary from '@/src/utils/ranksSalary'
import {WorkerSalary} from '@/src/utils/types'
import {
  GoogleSpreadsheetRow,
  GoogleSpreadsheetWorksheet,
} from 'google-spreadsheet'
import {NextRequest, NextResponse} from 'next/server'
import {auth} from '@/auth'
import updatePoints from '@/src/utils/admin/updatePoints'

const ADMIN_RANKS = ['платиновый', 'золотой', 'серебряный']

export interface SheetData {
  sheets: {
    workersSheet: GoogleSpreadsheetWorksheet
    actorsSheet: GoogleSpreadsheetWorksheet
    scheduleSheet: GoogleSpreadsheetWorksheet
    pointsSheet: GoogleSpreadsheetWorksheet
    goldPointsSheet: GoogleSpreadsheetWorksheet
    platinumPointsSheet: GoogleSpreadsheetWorksheet
  }
  rows: {
    workersRows: GoogleSpreadsheetRow[]
    actorsRows: GoogleSpreadsheetRow[]
    scheduleRows: GoogleSpreadsheetRow[]
    pointsRows: GoogleSpreadsheetRow[]
    goldPointsRows: GoogleSpreadsheetRow[]
    platinumPointsRows: GoogleSpreadsheetRow[]
  }
}

const loadData = async (doc: GoogleDocument): Promise<SheetData> => {
  await Promise.all([
    doc.actors.loadInfo(),
    doc.workers.loadInfo(),
    doc.schedule.loadInfo(),
  ])

  const workersSheet = doc.workers.sheetsByIndex[0]
  const actorsSheet = doc.actors.sheetsByIndex[0]
  const scheduleSheet = doc.schedule.sheetsByTitle['Сотрудники + расписание']
  const pointsSheet = doc.schedule.sheetsByTitle['Баллы онлайн']
  const goldPointsSheet = doc.schedule.sheetsByTitle['Баллы онлайн (ЗОЛОТО)']
  const platinumPointsSheet =
    doc.schedule.sheetsByTitle['Баллы онлайн (ПЛАТИНА) ']

  await Promise.all([
    workersSheet.loadHeaderRow(),
    actorsSheet.loadHeaderRow(),
    scheduleSheet.loadHeaderRow(7),
    pointsSheet.loadHeaderRow(),
    goldPointsSheet.loadHeaderRow(),
    platinumPointsSheet.loadHeaderRow(),
  ])

  const [
    workersRows,
    actorsRows,
    scheduleRows,
    pointsRows,
    goldPointsRows,
    platinumPointsRows,
  ]: GoogleSpreadsheetRow[][] = await Promise.all([
    workersSheet.getRows(),
    actorsSheet.getRows(),
    scheduleSheet.getRows(),
    pointsSheet.getRows(),
    goldPointsSheet.getRows(),
    platinumPointsSheet.getRows(),
  ])

  return {
    sheets: {
      workersSheet,
      actorsSheet,
      scheduleSheet,
      pointsSheet,
      goldPointsSheet,
      platinumPointsSheet,
    },
    rows: {
      workersRows,
      actorsRows,
      scheduleRows,
      pointsRows,
      goldPointsRows,
      platinumPointsRows,
    },
  }
}

const getWorkerRow = (workerName: string, rows: GoogleSpreadsheetRow[]) => {
  return rows.find(
    (row: GoogleSpreadsheetRow) =>
      // @ts-ignore
      row._rawData[0]?.split('-')[0]?.trim() === workerName.trim(),
  )
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const session = await auth()
  const user = session?.user

  const salaryData: WorkerSalary[] = body.salaryData?.filter(
    (data: WorkerSalary) => data.worker && data.workingHours && data.location,
  )

  const date = new Date(body.date)

  if (!user) {
    return NextResponse.json({message: 'Ошибка валидации'}, {status: 500})
  }

  if (!salaryData.length)
    return NextResponse.json(
      {message: 'Нет данных для отправки'},
      {status: 500},
    )

  if (!date) {
    return NextResponse.json({message: 'Не найдена дата'}, {status: 500})
  }

  const doc = google()

  const sheetData = await loadData(doc)
  const {scheduleRows, workersRows, actorsRows} = sheetData.rows
  const {
    workersSheet,
    actorsSheet,
    scheduleSheet,
    pointsSheet,
    goldPointsSheet,
    platinumPointsSheet,
  } = sheetData.sheets

  const workerRow = scheduleRows.find(
    (row: GoogleSpreadsheetRow) =>
      row.get('Позывной')?.split('-')[0]?.trim()?.toLowerCase() ===
      user.name?.toLowerCase(),
  )

  if (!ADMIN_RANKS.includes(workerRow?.get('Ранг').toLowerCase())) {
    return NextResponse.json({message: 'Нет прав'}, {status: 501})
  }

  const promises: Promise<boolean>[] = []

  for (const data of salaryData) {
    const workerRow = getWorkerRow(data.worker, workersRows)
    const actorRow = getWorkerRow(data.worker, actorsRows)

    const scheduleRow = scheduleRows.find(
      (row: GoogleSpreadsheetRow) =>
        row.get('Позывной')?.split('-')[0]?.trim()?.toLowerCase() ===
        data.worker.toLowerCase(),
    )

    const rank: string = scheduleRow?.get('Ранг')?.toLowerCase() || 'актёр'
    const dateColoumnNumber = workersSheet.headerValues.findIndex(
      (value: string) =>
        value.split(' ')[0] ===
        date.toLocaleDateString('ru-RU', {day: 'numeric', month: 'numeric'}),
    )
    const gamesCount = data.gamesCount || 1

    let workingTimeParts: string[] | number[] = data.workingHours.split('-')
    if (workingTimeParts.length < 2) continue

    workingTimeParts = workingTimeParts.map(v => parseInt(v))

    if (workingTimeParts[1] < 12) {
      workingTimeParts[1] += 24
    }

    const workingTime = workingTimeParts[1] - workingTimeParts[0]

    const overWorkTime = workingTime - (data.isHardTime ? 8 : 9)
    const isOverWork = overWorkTime > 0 && rank !== 'актёр'

    let calculatedWorkingTime = ''
    let calculatedOverWorkTime = ''

    if (data.isHardTime && isOverWork) {
      calculatedWorkingTime = `${workingTimeParts[0]}-${
        workingTimeParts[0] + 8
      }`
      calculatedOverWorkTime = `${workingTimeParts[0] + 8}-${
        workingTimeParts[0] + 8 + overWorkTime
      }`
    } else if (isOverWork) {
      calculatedWorkingTime = `${workingTimeParts[0]}-${
        workingTimeParts[0] + 9
      }`
      calculatedOverWorkTime = `${workingTimeParts[0] + 9}-${
        workingTimeParts[0] + 9 + overWorkTime
      }`
    } else {
      calculatedWorkingTime = `${workingTimeParts[0]}-${workingTimeParts[1]}`
    }

    if (data.bonuses.startsWith('=')) {
      data.bonuses = data.bonuses.slice(1)
    }

    const workerInfoData = {
      rank,
      calculatedWorkingTime,
      isOverWork,
      calculatedOverWorkTime,
      overWorkTime,
      gamesCount,
    }

    if (!data.comment?.toLowerCase().includes('под игру')) {
      promises.push(
        updatePoints({
          name: data.worker,
          rank,
          sheetData,
          hasGames: !!data.hasGames,
          comment: data.comment,
          location: data.location,
          date,
        }),
      )
    }

    if (actorRow) {
      promises.push(
        updateCells(
          actorsSheet,
          actorRow,
          dateColoumnNumber,
          data,
          workerInfoData,
        ),
      )
    } else if (workerRow) {
      promises.push(
        updateCells(
          workersSheet,
          workerRow,
          dateColoumnNumber,
          data,
          workerInfoData,
        ),
      )
    } else {
      let salary = ranksSalary[rank].default
      let message = `${date} ${data.location}\n\n${rank} | ${data.worker}\n\n${calculatedWorkingTime} ${ranksSalary[rank].default}`

      if (rank === 'актёр' && data.gamesCount && data.gamesCount > 2) {
        message += `\n${ranksSalary[rank].overWork * (data.gamesCount - 2)} (${
          ranksSalary[rank].overWork
        } * ${data.gamesCount - 2})`
        salary += ranksSalary[rank].overWork * (data.gamesCount - 2)
      }

      if (isOverWork) {
        message += `\n${calculatedOverWorkTime} ${
          ranksSalary[rank].overWork * overWorkTime
        }`
        salary += ranksSalary[rank].overWork * overWorkTime
      }

      if (data.comment) {
        message += `\n\n${data.comment}`
      }

      if (data.bonuses) {
        message += `\n\nБонусы: ${data.bonuses} ${evaluate(data.bonuses)}`
        salary += evaluate(data.bonuses)
      }

      message += `\n\nИтог: ${salary}\n\nНет в графике ${
        rank === 'актёр' ? 'актёров' : 'персонала'
      } 2025`

      await fetch(
        `https://api.telegram.org/bot${
          process.env.BOT_TOKEN || ''
        }/sendMessage`,
        {
          method: 'POST',
          headers: {'Content-Type': 'application/json'},
          body: JSON.stringify({
            chat_id: user.id,
            text: message,
          }),
        },
      )
    }
  }

  if (promises.length) {
    await Promise.all(promises).then(async () => {
      await Promise.all([
        workersSheet.saveUpdatedCells(),
        actorsSheet.saveUpdatedCells(),
        scheduleSheet.saveUpdatedCells(),
        pointsSheet.saveUpdatedCells(),
        goldPointsSheet.saveUpdatedCells(),
        platinumPointsSheet.saveUpdatedCells(),
      ])
    })
  }

  return NextResponse.json({}, {status: 200})
}
