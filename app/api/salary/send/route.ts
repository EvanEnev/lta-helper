import {NextRequest, NextResponse} from 'next/server'
import {WorkerSalary} from '@/src/utils/types'
import {DateTime} from 'luxon'
import db from '@/lib/database'
import convertTZ from '@/lib/functions/convertTZ'
import checkPermissions from '@/lib/functions/checkPermissions'
import getRanks from '@/lib/functions/getRanks'
import getSalaryData from '@/lib/functions/getSalaryData'
import logger from '@/Logger'
import getGamePayments from '@/lib/functions/getGamesPayments'
import {auth} from '@/lib/auth'
import {headers} from 'next/headers'
import getLocations from '@/lib/functions/getLocations'

interface KonsolBody {
  // title: string
  since_date: string
  // since_time: string
  upto_date: string
  duties: {
    template_id: number
    quantity: number
  }[]
  contractor: {name: string; phone: string}
  address_id: number
}

const KONSOL_DISABLED_RANKS = [10, 12, 13, 14, 2, 1, 6]

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

  if (!checkPermissions(['set_salary'], user)) {
    return NextResponse.json({message: 'Нет прав'}, {status: 501})
  }

  const konsolBodies: KonsolBody[] = []

  const gamesPayments = await getGamePayments()
  const locations = await getLocations()

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

    const location = locations.find(
      l => l.name.toLowerCase() === data.location.toLowerCase(),
    )!

    if (
      location.konsol_id &&
      !KONSOL_DISABLED_RANKS.includes(rankData?.id || 1)
    ) {
      const userDataQuery = `select
                               replace(replace(phone_number, ' ', ''), '-', '') as phone,
                               last_name || ' ' || first_name || ' ' || middle_name as name from workers
                            where name ilike ${data.worker}`

      const userData = await db.query(userDataQuery)

      const duties: KonsolBody['duties'] = []

      if (data.oneGames?.value) {
        duties.push({
          template_id: gamesPayments.find(d => d.id === data.oneGames!.id)!
            .konsol_id!,
          quantity: data.oneGames.number,
        })
      }

      if (data.twoGames?.value) {
        duties.push({
          template_id: gamesPayments.find(d => d.id === data.twoGames!.id)!
            .konsol_id!,
          quantity: data.twoGames.number,
        })
      }

      if (data.threeGames?.value) {
        duties.push({
          template_id: gamesPayments.find(d => d.id === data.threeGames!.id)!
            .konsol_id!,
          quantity: data.threeGames.number,
        })
      }

      const konsolBody: KonsolBody = {
        address_id: location.konsol_id,
        duties,
        contractor: {
          name: userData.rows[0].name,
          phone: userData.rows[0].phone,
        },
        since_date: date.toFormat('yyyy-MM-dd'),
        upto_date: date.toFormat('yyyy-MM-dd'),
      }

      konsolBodies.push(konsolBody)
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
                        ${location.id},
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
    } catch (e: any) {
      logger.error('sendWorkDays', {data: loggerData, error: e})
      return NextResponse.json({message: e.message || ''}, {status: 500})
    }
  }

  if (konsolBodies.length) {
    const konsolPromises = konsolBodies.map(body =>
      fetch('https://api.konsol.pro/bus/alpha/workflow/tasks', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${process.env.KONSOL_TOKEN}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      }),
    )

    try {
      await Promise.all(konsolPromises)
    } catch (e: any) {
      logger.error('konsolSend', {data: loggerData, error: e})
      return NextResponse.json({message: e.message || ''}, {status: 500})
    }
  }

  return NextResponse.json({}, {status: 200})
}
