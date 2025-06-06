import google, {GoogleDocument} from '@/lib/google'
import ranksSalary from '@/src/utils/ranksSalary'
import {WorkerSalary} from '@/src/utils/types'
import {
  GoogleSpreadsheetRow,
  GoogleSpreadsheetWorksheet,
} from 'google-spreadsheet'
import {NextRequest, NextResponse} from 'next/server'
import auth from '@/lib/auth'
import updatePoints from '@/src/utils/admin/updatePoints'
import db from '@/lib/database'

const ADMIN_RANKS = ['платиновый', 'золотой', 'серебряный']

export interface SheetData {
  sheets: {
    pointsSheet: GoogleSpreadsheetWorksheet
    goldPointsSheet: GoogleSpreadsheetWorksheet
    platinumPointsSheet: GoogleSpreadsheetWorksheet
  }
  rows: {
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

  const pointsSheet = google.schedule.sheetsByTitle['Баллы онлайн']
  const goldPointsSheet = google.schedule.sheetsByTitle['Баллы онлайн (ЗОЛОТО)']
  const platinumPointsSheet =
    google.schedule.sheetsByTitle['Баллы онлайн (ПЛАТИНА) ']

  await Promise.all([
    pointsSheet.loadHeaderRow(),
    goldPointsSheet.loadHeaderRow(),
    platinumPointsSheet.loadHeaderRow(),
  ])

  const [
    pointsRows,
    goldPointsRows,
    platinumPointsRows,
  ]: GoogleSpreadsheetRow[][] = await Promise.all([
    pointsSheet.getRows(),
    goldPointsSheet.getRows(),
    platinumPointsSheet.getRows(),
  ])

  return {
    sheets: {
      pointsSheet,
      goldPointsSheet,
      platinumPointsSheet,
    },
    rows: {
      pointsRows,
      goldPointsRows,
      platinumPointsRows,
    },
  }
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const user = await auth()

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
  const {pointsSheet, goldPointsSheet, platinumPointsSheet} = sheetData.sheets

  if (!ADMIN_RANKS.includes(user.rank.toLowerCase())) {
    return NextResponse.json({message: 'Нет прав'}, {status: 501})
  }

  const promises: Promise<boolean>[] = []
  const queries = []

  for (const data of salaryData) {
    const workerQuery = `SELECT rank FROM lt_arena.workers WHERE LOWER(name) = '${data.worker.toLowerCase()}'`
    const workerResult = await db.query(workerQuery)

    const rank = workerResult.rows[0].rank

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

    if (rank === 'актёр' && data.gamesCount && data.gamesCount > 2) {
      overworkSalary += ranksSalary[rank].overWork * (data.gamesCount - 2)
    }

    if (isOverWork) {
      overworkSalary += ranksSalary[rank].overWork * overWorkTime
    }

    let defaultSalary = ranksSalary[rank]?.default
    let overworkSalary = 0

    if (rank === 'актёр' && data.gamesCount && data.gamesCount > 2) {
      overworkSalary += ranksSalary[rank].overWork * (data.gamesCount - 2)
    }

    if (isOverWork) {
      overworkSalary += ranksSalary[rank].overWork * overWorkTime
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
    
    const workingStart = calculatedWorkingTime.split('-')[0]
    let workingEnd = calculatedWorkingTime.split('-')[1]

    if (parseInt(workingEnd) > 25) {
      workingEnd = `${parseInt(workingEnd) - 24}`
    }

    const overworkStart = calculatedOverWorkTime.split('-')[0]
    let overworkEnd = calculatedOverWorkTime.split('-')[1]

    if (parseInt(overworkEnd) > 25) {
      overworkEnd = `${parseInt(overworkEnd) - 24}`
    }

    queries.push(`INSERT INTO lt_arena.salary
                  (worker_id, date, value, bonuses, fines, comment, location_id, created_by, start_time, end_time, overwork_start, overwork_end, overwork)
                  VALUES
                    (
                        (SELECT id FROM lt_arena.workers WHERE LOWER(name) = '${data.worker.toLowerCase()}'),
                        '${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}',
                        ${defaultSalary},
                        '${data.bonuses || 0}',
                        '${data.fines || 0}',
                        '${data.comment}',
                        (SELECT id FROM lt_arena.locations WHERE LOWER(name) = '${data.location.toLowerCase()}'),
                        (SELECT id FROM lt_arena.workers WHERE telegram_id = ${user.id}),
                        '${workingStart}:00',
                        '${workingEnd}:00',
                        ${overworkStart ? `'${overworkStart}:00'` : 'NULL'},
                        ${overworkEnd ? `'${overworkEnd}:00'` : 'NULL'},
                        ${overworkSalary || 'NULL'}
                    )
                  ON CONFLICT (worker_id, date, location_id) DO UPDATE
                    SET
                      value=excluded.value,
                      bonuses=excluded.bonuses,
                      fines=excluded.fines,
                      comment=excluded.comment,
                      created_by=excluded.created_by,
                      start_time=excluded.start_time,
                      end_time=excluded.end_time,
                      overwork_start=excluded.overwork_start,
                      overwork_end=excluded.overwork_end,
                      overwork=excluded.overwork
    `)
  }

  if (promises.length) {
    const queriesPromises = queries.map(query => db.query(query))
    await Promise.all([...promises, ...queriesPromises]).then(async () => {
      await Promise.all([
        pointsSheet.saveUpdatedCells(),
        goldPointsSheet.saveUpdatedCells(),
        platinumPointsSheet.saveUpdatedCells(),
      ])
    })
  }

  return NextResponse.json({}, {status: 200})
}
