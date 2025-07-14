import google, {GoogleDocument} from '@/lib/google'
import {WorkerSalary} from '@/src/utils/types'
import {
  GoogleSpreadsheetRow,
  GoogleSpreadsheetWorksheet,
} from 'google-spreadsheet'
import {NextRequest, NextResponse} from 'next/server'
import auth from '@/lib/auth'
import updatePoints from '@/src/utils/admin/updatePoints'
import db from '@/lib/database'
import {DateTime} from 'luxon'
import convertTZ from '@/lib/functions/convertTZ'
import getRanks from '@/lib/functions/getRanks'
import checkPermissions from '@/lib/functions/checkPermissions'
import getSalaryData from '@/lib/functions/getSalaryData'
import logger from '@/lib/Logger'

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

  let date: Date | DateTime = new Date(body.date)

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

  const loggerData: any = {}

  date = convertTZ(date, 'Europe/Moscow')

  const sheetData = await loadData(google)
  const {pointsSheet, goldPointsSheet, platinumPointsSheet} = sheetData.sheets

  if (!checkPermissions(['set_salary'], user)) {
    return NextResponse.json({message: 'Нет прав'}, {status: 501})
  }

  const ranks = await getRanks()

  const promises: Promise<boolean>[] = []
  const queries = []

  for (const data of salaryData) {
    if (data.deleted) {
      queries.push(
        `DELETE FROM lt_arena.salary
       WHERE worker_id = (SELECT id from lt_arena.workers WHERE LOWER(name) = '${data.worker.toLowerCase()}')
         AND location_id = (SELECT id FROM lt_arena.locations WHERE LOWER(name) = '${data.location.toLowerCase()}')
         AND date = '${date.toFormat('yyyy-MM-dd')}'`,
      )

      continue
    }

    const workerQuery = `SELECT rank FROM lt_arena.workers WHERE LOWER(name) = '${data.worker.toLowerCase()}'`
    const workerResult = await db.query(workerQuery)

    const rank: string = workerResult.rows[0].rank?.trim()
    const rankData = ranks.find(r => r.name === rank)

    const salary = getSalaryData({
      rank: rankData,
      bonuses: data.bonuses,
      fines: data.fines,
      comment: data.comment,
      gamesCount: data.gamesCount,
      value: data.value,
      overwork: data.overwork,
      isHardTime: data.isHardTime,
      worker: user,
      workingHours: data.workingHours,
    })

    loggerData.salary = salary

    if (!salary) continue

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

    queries.push(`INSERT INTO lt_arena.salary
                  (worker_id, date, value, bonuses, fines, comment, location_id, created_by, start_time, end_time, overwork_start, overwork_end, overwork)
                  VALUES
                    (
                        (SELECT id FROM lt_arena.workers WHERE LOWER(name) = '${data.worker.toLowerCase()}'),
                        '${date.toFormat('yyyy-MM-dd')}',
                        ${salary.value},
                        '${salary.bonuses}',
                        '${salary.fines}',
                        '${data.comment}',
                        (SELECT id FROM lt_arena.locations WHERE LOWER(name) = '${data.location.toLowerCase()}'),
                        ${salary.created_by},
                        '${salary.start_time}',
                        '${salary.end_time}',
                        ${salary.overwork_start ? `'${salary.overwork_start}'` : 'NULL'},
                        ${salary.overwork_end ? `'${salary.overwork_end}'` : 'NULL'},
                        ${salary.overwork || 'NULL'}
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

  loggerData.queries = queries
  loggerData.user = user

  logger.info('sendWorkDays', {data: loggerData})

  if (queries.length) {
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
