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
import {auth} from '@/lib/auth'
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

const loadData = async (google: GoogleDocument): Promise<SheetData> => {
  await Promise.all([
    google.actors.loadInfo(),
    google.workers.loadInfo(),
    google.schedule.loadInfo(),
  ])

  const workersSheet = google.workers.sheetsByIndex[0]
  const actorsSheet = google.actors.sheetsByIndex[0]
  const scheduleSheet = google.schedule.sheetsByTitle['Сотрудники + расписание']
  const pointsSheet = google.schedule.sheetsByTitle['Баллы онлайн']
  const goldPointsSheet = google.schedule.sheetsByTitle['Баллы онлайн (ЗОЛОТО)']
  const platinumPointsSheet =
    google.schedule.sheetsByTitle['Баллы онлайн (ПЛАТИНА) ']

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

  const sheetData = await loadData(google)
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
  const queries = []

  for (const data of salaryData) {
    const workerRow = getWorkerRow(data.worker, workersRows)
    const actorRow = getWorkerRow(data.worker, actorsRows)

    let bonuses = data.bonuses || '' + data.fines || ''

    const scheduleRow = scheduleRows.find(
      (row: GoogleSpreadsheetRow) =>
        row.get('Позывной')?.split('-')[0]?.trim()?.toLowerCase() ===
        data.worker.toLowerCase(),
    )

    const rank: string = scheduleRow?.get('Ранг')?.toLowerCase() || 'актёр'
    const dateColumnNumber = workersSheet.headerValues.findIndex(
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

    if (bonuses.includes('=')) {
      bonuses = bonuses.replaceAll('=', '')
    }

    const workerInfoData = {
      rank,
      calculatedWorkingTime,
      isOverWork,
      calculatedOverWorkTime,
      overWorkTime,
      gamesCount,
    }

    let defaultSalary = ranksSalary[rank]?.default
    let overworkSalary = 0

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
          dateColumnNumber,
          data,
          workerInfoData,
        ),
      )
    } else if (workerRow) {
      promises.push(
        updateCells(
          workersSheet,
          workerRow,
          dateColumnNumber,
          data,
          workerInfoData,
        ),
      )
    } else {
      let salary = ranksSalary[rank].default
      let message = `${date.toLocaleDateString('ru-RU', {month: 'numeric', day: 'numeric'})} ${data.location}\n\n${rank} | ${data.worker}\n\n${calculatedWorkingTime} ${ranksSalary[rank].default}`

      if (rank === 'актёр' && data.gamesCount && data.gamesCount > 2) {
        message += `\n${ranksSalary[rank].overWork * (data.gamesCount - 2)} (${
          ranksSalary[rank].overWork
        } * ${data.gamesCount - 2})`
        salary += ranksSalary[rank].overWork * (data.gamesCount - 2)

        overworkSalary += ranksSalary[rank].overWork * (data.gamesCount - 2)
      }

      if (isOverWork) {
        message += `\n${calculatedOverWorkTime} ${
          ranksSalary[rank].overWork * overWorkTime
        }`

        overworkSalary += ranksSalary[rank].overWork * overWorkTime

        salary += ranksSalary[rank].overWork * overWorkTime
      }

      if (data.comment) {
        message += `\n\n${data.comment}`
      }

      if (bonuses) {
        message += `\n\nБонусы: ${bonuses} ${evaluate(bonuses)}`
        salary += evaluate(bonuses)
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

    queries.push(`INSERT INTO lt_arena.salary (worker_id, date, value, bonuses, fines, comment, location_id, created_by, start_time, end_time)
                  VALUES
                    (
                     (SELECT id FROM lt_arena.workers WHERE LOWER(name) = ${data.worker.toLowerCase()}),
                      '${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}',
                     ${defaultSalary},
                     '${data.bonuses}',
                     
                    )`)
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

  const query = `INSERT INTO lt_arena.salary (worker_id, date, value, bonuses, fines, comment, location_id, created_by, start_time, end_time)
    VALUES
    ()`

  return NextResponse.json({}, {status: 200})
}
