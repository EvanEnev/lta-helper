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
  worker_id?: number
  date?: string
  title: string
  since_date: string
  upto_date: string
  duties: {
    template_id: number
    quantity: number
    price: number
  }[]
  contractor?: {phone: string}
  contractor_ids: number[]
  address_id: number
}

const KONSOL_DISABLED_RANKS = [10, 12, 13, 14, 2, 1, 6]

export async function POST(req: NextRequest) {
  const body = await req.json()
  const worker = (await auth.api.getSession({
    headers: await headers(),
  }))!.user

  const salaryData: WorkerSalary[] = body.salaryData?.filter(
    (data: WorkerSalary) => data.worker && data.location,
  )

  let date: Date | DateTime = new Date(body.date)

  if (!worker) {
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

  if (!checkPermissions(['set_salary'], worker)) {
    return NextResponse.json({message: 'Нет прав'}, {status: 501})
  }

  const konsolBodies: KonsolBody[] = []

  const gamesPayments = await getGamePayments()
  const locations = await getLocations()

  const ranks = await getRanks()

  const promises: Promise<boolean>[] = []
  const queries = []

  const isConfirmed =
    DateTime.now().setZone('Europe/Moscow').toFormat('yyyy-MM-dd') ===
    date.toFormat('yyyy-MM-dd')

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

    const salary = getSalaryData({
      gamesPayments,
      worker,
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

    const taskIdQuery = `select task_id from salary.list where worker_id = (select id from workers where name ilike '${data.worker}')  and date = '${date.toFormat('yyyy-MM-dd')}'`
    const taskIdResult = await db.query(taskIdQuery)
    const taskId = taskIdResult.rows[0]?.task_id

    const location = locations.find(
      l => l.name.toLowerCase() === data.location.toLowerCase(),
    )!

    if (
      !taskId &&
      location.konsol_id &&
      !KONSOL_DISABLED_RANKS.includes(rankData?.id || 1)
    ) {
      const userDataQuery = `select
                              id,
                               replace(replace(phone_number, ' ', ''), '-', '') as phone
                            from workers
                            where name ilike '${data.worker}'`

      const userData = await db.query(userDataQuery)

      const duties: KonsolBody['duties'] = [
        {
          template_id: 75920,
          quantity: 1,
          price: salary.value,
        },
      ]

      ;['oneGames', 'twoGames', 'threeGames'].forEach(game => {
        // @ts-ignore
        if (salary[game] && data[game]?.number) {
          // @ts-ignore
          const paymentData = gamesPayments.find(d => d.id === data[game]?.id)!

          duties.push({
            template_id: paymentData.konsol_id!,
            // @ts-ignore
            quantity: data[game].number,
            price: paymentData.value,
          })
        }
      })

      const konsolBody: KonsolBody = {
        worker_id: userData.rows[0].id,
        date: date.toFormat('yyyy-MM-dd'),
        title: 'Проведение лазертаг-игр',
        address_id: location.konsol_id,
        duties,
        contractor: {
          phone: userData.rows[0].phone,
        },
        since_date: date.toFormat('yyyy-MM-dd'),
        upto_date: date.toFormat('yyyy-MM-dd'),
        contractor_ids: [],
      }

      konsolBodies.push(konsolBody)
    }

    if (!data.comment?.toLowerCase().includes('под игру')) {
      queries.push(
        `insert into relations.workers_requirements
         (requirement_id, worker_id, value)
       select
         r.id,
         w.id,
         1
       from workers w
              join ranks.requirements r
                   on r.rank_id = w.rank_id
       where w.id = (select id FROM workers WHERE name ilike '${data.worker}')
         and (r.meta ->> 'auto')::bool = true

       on conflict (requirement_id, worker_id)
         do update
         set value = relations.workers_requirements.value + 1
      where not exists(
        select 1 from salary.list where worker_id = relations.workers_requirements.worker_id and date = '${date.toFormat('yyyy-MM-dd')}'
      )
      `,
      )
    }

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
                      work_types=excluded.work_types,
                      is_confirmed=${isConfirmed}
    `)
  }

  loggerData.queries = queries
  loggerData.user = worker

  logger.info('sendWorkDays', {data: loggerData})

  const konsolIds: number[] = []

  for (const body1 of konsolBodies) {
    const workerId = body1.worker_id!
    const date = body1.date!

    const locationRes = await fetch(
      `https://api.konsol.pro/bus/alpha/workflow/locations/${body1.address_id}`,
      {
        method: 'GET',
        headers: {Authorization: `${process.env.KONSOL_TOKEN}`},
      },
    )

    let locationData
    try {
      locationData = await locationRes.json()
    } catch (e: any) {
      return NextResponse.json(
        {
          message: e instanceof Error ? e.message || '' : '',
        },
        {
          status: 500,
        },
      )
    }

    if (!locationData.success) {
      return NextResponse.json(
        {
          message: locationData.errors?.length
            ? locationData.errors.join('; ')
            : locationData.error,
        },
        {
          status: 500,
        },
      )
    }

    body1.address_id = locationData.address.id

    const workerRes = await fetch(
      `https://api.konsol.pro/v2/contractors?phone=${body1.contractor!.phone}`,
      {
        method: 'GET',
        headers: {Authorization: `${process.env.KONSOL_TOKEN}`},
      },
    )

    let workerData
    try {
      workerData = (await workerRes.json())[0]
    } catch (e: any) {
      return NextResponse.json(
        {
          message: e instanceof Error ? e.message || '' : '',
        },
        {
          status: 500,
        },
      )
    }

    if (!workerData.success) {
      return NextResponse.json(
        {
          message: workerData.errors?.length
            ? workerData.errors.join('; ')
            : workerData.error,
        },
        {
          status: 500,
        },
      )
    }

    body1.contractor_ids = [workerData.id]

    delete body1.contractor
    delete body1.worker_id
    delete body1.date

    const res = await fetch(
      'https://api.konsol.pro/bus/alpha/workflow/platform/tasks ',
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${process.env.KONSOL_TOKEN}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body1),
      },
    )

    let resData
    try {
      resData = await res.json()
    } catch (e: any) {
      return NextResponse.json(
        {
          message: e instanceof Error ? e.message || '' : '',
        },
        {
          status: 500,
        },
      )
    }

    if (!resData.success) {
      return NextResponse.json(
        {
          message: resData.errors?.length
            ? resData.errors.join('; ')
            : resData.error,
        },
        {
          status: 500,
        },
      )
    }

    const taskId: number = resData.task_id

    konsolIds.push(taskId)

    const query = `update salary.list set task_id = ${taskId} where worker_id=${workerId} and date='${date}'`
    queries.push(query)
  }

  if (konsolIds.length) {
    await fetch('https://api.konsol.pro/bus/alpha/workflow/tasks/submit', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.KONSOL_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ids: konsolIds}),
    })
  }

  if (queries.length) {
    const queriesPromises = queries.map(query => db.query(query))
    try {
      await Promise.all([...promises, ...queriesPromises])
    } catch (e: any) {
      logger.error('sendWorkDays', {data: loggerData, error: e})
      return NextResponse.json({message: e.message || ''}, {status: 500})
    }
  }

  return NextResponse.json({}, {status: 200})
}
