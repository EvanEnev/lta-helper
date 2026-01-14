import {NextRequest, NextResponse} from 'next/server'
import {WorkerSalary} from '@/src/utils/types'
import {DateTime} from 'luxon'
// import google, {GoogleDocument} from '@/lib/google'
// import {
//   GoogleSpreadsheetRow,
//   GoogleSpreadsheetWorksheet,
// } from 'google-spreadsheet'
import db from '@/lib/database'
import convertTZ from '@/lib/functions/convertTZ'
import checkPermissions from '@/lib/functions/checkPermissions'
import getRanks from '@/lib/functions/getRanks'
import getSalaryData from '@/lib/functions/getSalaryData'
// import updatePoints from '@/src/utils/admin/updatePoints'
import logger from '@/Logger'
import getGamePayments from '@/lib/functions/getGamesPayments'
import {auth} from '@/lib/auth'
import {headers} from 'next/headers'

// export interface SheetData {
//   sheets: {
//     pointsSheet: GoogleSpreadsheetWorksheet
//     goldPointsSheet: GoogleSpreadsheetWorksheet
//     platinumPointsSheet: GoogleSpreadsheetWorksheet
//   }
//   rows: {
//     pointsRows: GoogleSpreadsheetRow[]
//     goldPointsRows: GoogleSpreadsheetRow[]
//     platinumPointsRows: GoogleSpreadsheetRow[]
//   }
// }

// const loadData = async (google: GoogleDocument): Promise<SheetData> => {
//   await Promise.all([
//     google.actors.loadInfo(),
//     google.workers.loadInfo(),
//     google.schedule.loadInfo(),
//   ])
//
//   const pointsSheet = google.schedule.sheetsByTitle['Баллы онлайн']
//   const goldPointsSheet = google.schedule.sheetsByTitle['Баллы онлайн (ЗОЛОТО)']
//   const platinumPointsSheet =
//     google.schedule.sheetsByTitle['Баллы онлайн (ПЛАТИНА) ']
//
//   // await Promise.all([
//   //   pointsSheet.loadHeaderRow(),
//   //   goldPointsSheet.loadHeaderRow(),
//   //   platinumPointsSheet.loadHeaderRow(),
//   // ])
//
//   const [
//     pointsRows,
//     goldPointsRows,
//     platinumPointsRows,
//   ]: GoogleSpreadsheetRow[][] = await Promise.all([
//     pointsSheet.getRows(),
//     goldPointsSheet.getRows(),
//     platinumPointsSheet.getRows(),
//   ])
//
//   return {
//     sheets: {
//       pointsSheet,
//       goldPointsSheet,
//       platinumPointsSheet,
//     },
//     rows: {
//       pointsRows,
//       goldPointsRows,
//       platinumPointsRows,
//     },
//   }
// }

export async function POST(req: NextRequest) {
  const body = await req.json()
  const {user} = (await auth.api.getSession({
    headers: await headers(),
  })) || {user: null}

  const salaryData: WorkerSalary[] = body.salaryData?.filter(
    (data: WorkerSalary) => data.worker && data.location,
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

  const loggerData: any = {salary: []}

  date = convertTZ(date, 'Europe/Moscow')

  // const sheetData = await loadData(google)
  // const {pointsSheet, goldPointsSheet, platinumPointsSheet} = sheetData.sheets

  if (!checkPermissions(['set_salary'], user)) {
    return NextResponse.json({message: 'Нет прав'}, {status: 501})
  }

  const ranks = await getRanks()

  const promises: Promise<boolean>[] = []
  const queries = []

  for (const data of salaryData) {
    if (data.deleted) {
      queries.push(
        `DELETE FROM salary.list
       WHERE worker_id = (SELECT id from workers WHERE LOWER(name) = '${data.worker.toLowerCase()}')
         AND location_id = (SELECT id FROM locations WHERE LOWER(name) = '${data.location.toLowerCase()}')
         AND date = '${date.toFormat('yyyy-MM-dd')}'`,
      )

      continue
    }

    const workerQuery = `SELECT r.name as rank FROM workers w left join ranks r on r.id = w.rank_id WHERE w.name ilike '${data.worker}'`
    const workerResult = await db.query(workerQuery)

    const rank: string = workerResult.rows[0].rank?.trim()
    const rankData = ranks.find(r => r.name === rank)

    const gamesPayments = await getGamePayments()

    console.debug(data)
    const salary = getSalaryData({
      gamesPayments,
      worker: user,
      rank: rankData,
      workingHours: data.location === 'Другое' ? '10-19' : data.workingHours,
      fines: data.fines,
      isHardTime: data.isHardTime,
      comment: data.comment,
      bonuses: data.bonuses,
      oneGames: {
        id: data.oneGames?.id || 0,
        number: data.oneGames?.number || 0,
      },
      twoGames: {
        id: data.twoGames?.id || 0,
        number: data.twoGames?.number || 0,
      },
      threeGames: {
        id: data.threeGames?.id || 0,
        number: data.threeGames?.number || 0,
      },
      actorGames: {
        id: data.actorGames?.id || 0,
        number: data.actorGames?.number || 0,
      },
      override: {
        value: data.value,
        overwork: data.location === 'Другое' ? 0 : data.overwork,
        oneGames: data.oneGames?.value,
        twoGames: data.twoGames?.value,
        threeGames: data.threeGames?.value,
        actorGames: data.actorGames?.value,
      },
    })

    loggerData.salary.push(salary)

    if (!salary) continue

    // if (!data.comment?.toLowerCase().includes('под игру')) {
    //   promises.push(
    //     updatePoints({
    //       name: data.worker,
    //       rank,
    //       sheetData,
    //       hasGames: !!data.hasGames,
    //       comment: data.comment,
    //       location: data.location,
    //       date,
    //     }),
    //   )
    // }

    if (data.withoutDate) {
      const query = `SELECT date FROM salary.list WHERE
                                   worker_id = (SELECT id FROM workers WHERE LOWER(name) = '${data.worker.toLowerCase()}')
                                   AND date BETWEEN '${date.startOf('month').toFormat('yyyy-MM-dd')}'
                                     AND '${date.endOf('month').toFormat('yyyy-MM-dd')}'`
      const result = await db.query(query)

      const dates = result.rows.map(row => row.date)
      date = date.set({day: date.endOf('month').day})

      while (
        dates.find(
          // @ts-ignore
          d => d.toFormat('yyyy-MM-dd') === date.toFormat('yyyy-MM-dd'),
        )
      ) {
        date = date.minus({days: 1})
      }
    }

    console.debug(salary)
    queries.push(`INSERT INTO salary.list
                  (worker_id, date, value, bonuses, fines, comment, location_id, created_by, start_time, end_time, overwork_start, overwork_end, overwork, type, one_games, two_games, three_games, actor_games, work_types)
                  VALUES
                    (
                        (SELECT id FROM workers WHERE name ilike '${data.worker}'),
                        '${date.toFormat('yyyy-MM-dd')}',
                        ${salary.value || 0},
                        '${salary.bonuses}',
                        '${salary.fines}',
                        '${data.comment}',
                        (SELECT id FROM locations WHERE LOWER(name) = '${data.location.toLowerCase()}'),
                        ${salary.created_by},
                        '${salary.start_time || '00'}',
                        '${salary.end_time || '00'}',
                        ${salary.overwork_start ? (!data.type ? `'${salary.overwork_start}'` : 'NULL') : 'NULL'},
                        ${salary.overwork_end ? (!data.type ? `'${salary.overwork_end}'` : 'NULL') : 'NULL'},
                        ${salary.overwork || 'NULL'},
                        ${data.type ? `'${data.type}'` : 'NULL'},
                        ${
                          data.oneGames?.id
                            ? `json_build_object(
                        'id', ${data.oneGames.id},
                        'value', ${salary.oneGames},
                        'number', ${data.oneGames.number}
                        )`
                            : 'NULL'
                        },
                        ${
                          data.twoGames?.id
                            ? `json_build_object(
                        'id', ${data.twoGames.id},
                        'value', ${salary.twoGames},
                        'number', ${data.twoGames.number}
                        )`
                            : 'NULL'
                        },
                        ${
                          data.threeGames?.id
                            ? `json_build_object(
                        'id', ${data.threeGames.id},
                        'value', ${salary.threeGames},
                        'number', ${data.threeGames.number}
                        )`
                            : 'NULL'
                        },
                        ${
                          data.actorGames?.id
                            ? `json_build_object(
                        'id', ${data.actorGames.id},
                        'value',  ${salary.actorGames},
                        'number', ${data.actorGames.number}
                        )`
                            : 'NULL'
                        },
                        ${data.workTypes?.length ? `array[${data.workTypes}]` : 'NULL'}
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
                      overwork=excluded.overwork,
                      one_games=excluded.one_games,
                      two_games=excluded.two_games,
                      three_games=excluded.three_games,
                      actor_games=excluded.actor_games,
                      work_types=excluded.work_types
    `)
  }

  loggerData.queries = queries
  loggerData.user = user

  logger.info('sendWorkDays', {data: loggerData})

  if (queries.length) {
    const queriesPromises = queries.map(query => db.query(query))
    try {
      await Promise.all([...promises, ...queriesPromises])
      //   .then(async () => {
      //   await Promise.all([
      //     pointsSheet.saveUpdatedCells(),
      //     goldPointsSheet.saveUpdatedCells(),
      //     platinumPointsSheet.saveUpdatedCells(),
      //   ])
      // })
    } catch (e: any) {
      logger.error('sendWorkDays', {data: loggerData, error: e})
      return NextResponse.json({message: e.message || ''}, {status: 500})
    }
  }

  return NextResponse.json({}, {status: 200})
}
