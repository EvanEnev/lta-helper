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

interface Query {
  text: string
  values: unknown[]
}

const fail = (message: string, status = 400) =>
  NextResponse.json({message}, {status})

const str = (value: unknown, max = 1000) =>
  typeof value === 'string' ? value.slice(0, max) : ''

const num = (value: unknown) => {
  const n = Number(value)

  return Number.isFinite(n) ? n : 0
}

const gameJson = (
  game: {id?: number; number?: number} | null | undefined,
  value: unknown,
) =>
  game?.id
    ? JSON.stringify({
        id: num(game.id),
        value: num(value),
        number: num(game.number),
      })
    : null

export async function POST(req: NextRequest) {
  const session = await auth.api.getSession({headers: await headers()})
  const worker = session?.user

  if (!worker) return fail('Вход не произведён', 401)

  if (!checkPermissions(['set_salary'], worker)) return fail('Нет прав', 403)

  const body = await req.json().catch(() => null)

  const salaryData: WorkerSalary[] = (
    Array.isArray(body?.salaryData) ? body.salaryData : []
  ).filter(
    (data: WorkerSalary) =>
      typeof data?.worker === 'string' &&
      data.worker &&
      typeof data?.location === 'string' &&
      data.location,
  )

  if (!salaryData.length) return fail('Нет данных для отправки')

  const rawDate = new Date(body.date)

  if (Number.isNaN(rawDate.getTime())) return fail('Не найдена дата')

  let date: DateTime = convertTZ(rawDate, 'Europe/Moscow')

  const loggerData: any = {salary: []}

  const konsolBodies: KonsolBody[] = []

  const gamesPayments = await getGamePayments()
  const locations = await getLocations()

  const ranks = await getRanks()

  const queries: Query[] = []
  const warnings = []

  const isConfirmed = date.diff(DateTime.now(), 'days').days <= 0

  for (const data of salaryData) {
    const workerName = data.worker.trim()
    const locationName = data.location.trim()
    const day = date.toFormat('yyyy-MM-dd')

    if (data.deleted) {
      queries.push({
        text: `DELETE FROM salary.list
         WHERE worker_id = (SELECT id from workers WHERE LOWER(name) = LOWER($1))
           AND location_id = (SELECT id FROM locations WHERE LOWER(name) = LOWER($2))
           AND date = $3`,
        values: [workerName, locationName, day],
      })

      continue
    }

    if (!data.withoutDate) {
      const existedDataResult = await db.query(
        `SELECT id, (select name from locations where id = location_id) as location FROM salary.list
         WHERE worker_id = (SELECT id from workers WHERE LOWER(name) = LOWER($1))
           and location_id != (SELECT id FROM locations WHERE LOWER(name) = LOWER($2))
           AND date = $3`,
        [workerName, locationName, day],
      )
      const existedData = existedDataResult.rows[0]

      if (existedData?.id) {
        warnings.push(`${data.worker}: ${existedData.location}`)
        continue
      }
    }

    const workerResult = await db.query(
      `SELECT r.name as rank FROM workers w left join ranks r on r.id = w.rank_id WHERE LOWER(w.name) = LOWER($1)`,
      [workerName],
    )

    if (!workerResult.rowCount)
      return fail(`Сотрудник не найден: ${workerName}`)

    const rank: string = workerResult.rows[0].rank?.trim()
    const rankData = ranks.find(r => r.name === rank)

    const isTyped = data.location === 'Другое'

    const salary = getSalaryData({
      gamesPayments,
      worker,
      rank: rankData,
      workingHours: isTyped ? '10-19' : data.workingHours,
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
        value: isTyped ? (data.value ? data.value : 0) : data.value,
        overwork: isTyped ? 0 : data.overwork,
        oneGames: data.oneGames?.value,
        twoGames: data.twoGames?.value,
        threeGames: data.threeGames?.value,
        actorGames: data.actorGames?.value,
      },
    })

    loggerData.salary.push(salary)

    if (!salary) continue

    if (data.withoutDate) {
      const result = await db.query(
        `SELECT date FROM salary.list WHERE
           worker_id = (SELECT id FROM workers WHERE LOWER(name) = LOWER($1))
           AND date BETWEEN $2 AND $3`,
        [
          workerName,
          date.startOf('month').toFormat('yyyy-MM-dd'),
          date.endOf('month').toFormat('yyyy-MM-dd'),
        ],
      )

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

    const finalDay = date.toFormat('yyyy-MM-dd')

    const taskIdResult = await db.query(
      `select task_id from salary.list where worker_id = (select id from workers where LOWER(name) = LOWER($1)) and date = $2`,
      [workerName, finalDay],
    )
    const taskId = taskIdResult.rows[0]?.task_id

    const location = locations.find(
      l => l.name.toLowerCase() === locationName.toLowerCase(),
    )

    if (!location) return fail(`Локация не найдена: ${locationName}`)

    if (
      !isConfirmed &&
      !taskId &&
      location.konsol_id &&
      !KONSOL_DISABLED_RANKS.includes(rankData?.id || 1)
    ) {
      const userData = await db.query(
        `select
           id,
           replace(replace(phone_number, ' ', ''), '-', '') as phone
         from workers
         where LOWER(name) = LOWER($1)`,
        [workerName],
      )

      const duties: KonsolBody['duties'] = [
        {
          template_id: 75920,
          quantity: 1,
          price: salary.value,
        },
      ]

      ;['oneGames', 'twoGames', 'threeGames', 'actorGames'].forEach(game => {
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
        date: finalDay,
        title: 'Проведение лазертаг-игр',
        address_id: location.konsol_id,
        duties,
        contractor: {
          phone: userData.rows[0].phone,
        },
        since_date: finalDay,
        upto_date: finalDay,
        contractor_ids: [],
      }

      konsolBodies.push(konsolBody)
    }

    if (!data.comment?.toLowerCase().includes('под игру')) {
      queries.push({
        text: `insert into relations.workers_requirements
           (requirement_id, worker_id, value)
         select
           r.id,
           w.id,
           1
         from workers w
                join ranks.requirements r
                     on r.rank_id = w.rank_id
         where w.id = (select id FROM workers WHERE LOWER(name) = LOWER($1))
           and (r.meta ->> 'auto')::bool = true

         on conflict (requirement_id, worker_id)
           do update
           set value = relations.workers_requirements.value + 1
         where not exists(
           select 1 from salary.list where worker_id = relations.workers_requirements.worker_id and date = $2
         )`,
        values: [workerName, finalDay],
      })
    }

    const workTypes = Array.isArray(data.workTypes)
      ? data.workTypes.map(Number).filter(Number.isInteger)
      : []
    const typed = data.type ? str(data.type, 100) : null

    queries.push({
      text: `INSERT INTO salary.list
                  (worker_id, date, value, bonuses, fines, comment, location_id, created_by, start_time, end_time, overwork_start, overwork_end, overwork, type, one_games, two_games, three_games, actor_games, work_types, is_confirmed)
                  VALUES
                    (
                        (SELECT id FROM workers WHERE LOWER(name) = LOWER($1)),
                        $2,
                        $3,
                        $4,
                        $5,
                        $6,
                        $7,
                        $8,
                        $9,
                        $10,
                        $11,
                        $12,
                        $13,
                        $14,
                        $15::jsonb,
                        $16::jsonb,
                        $17::jsonb,
                        $18::jsonb,
                        $19::int[],
                        $20
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
                      is_confirmed=excluded.is_confirmed`,
      values: [
        workerName,
        finalDay,
        salary.value || 0,
        String(salary.bonuses ?? ''),
        String(salary.fines ?? ''),
        str(data.comment),
        location.id,
        salary.created_by,
        salary.start_time || '00',
        salary.end_time || '00',
        salary.overwork_start && !data.type ? salary.overwork_start : null,
        salary.overwork_end && !data.type ? salary.overwork_end : null,
        salary.overwork || null,
        typed,
        gameJson(data.oneGames, salary.oneGames),
        gameJson(data.twoGames, salary.twoGames),
        gameJson(data.threeGames, salary.threeGames),
        gameJson(data.actorGames, salary.actorGames),
        workTypes.length ? workTypes : null,
        isConfirmed,
      ],
    })
  }

  loggerData.queries = queries.map(q => q.text)
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
          message:
            e instanceof Error ? e.message || 'locationData' : 'locationData',
        },
        {
          status: 500,
        },
      )
    }

    if (locationData.error || locationData.errors?.length) {
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
          message:
            e instanceof Error ? e.message || 'workerData' : 'workerData',
        },
        {
          status: 500,
        },
      )
    }

    if (!workerData) {
      continue
    }

    if (workerData.error || workerData.errors?.length) {
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
          message: e instanceof Error ? e.message || 'resData' : 'resData',
        },
        {
          status: 500,
        },
      )
    }

    if (resData.error || resData.errors?.length) {
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

    queries.push({
      text: 'update salary.list set task_id = $1 where worker_id = $2 and date = $3',
      values: [taskId, workerId, date],
    })
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

  if (queries.length && !warnings.length) {
    const client = await db.connect()

    try {
      await client.query('begin')

      for (const query of queries) {
        await client.query(query.text, query.values)
      }

      await client.query('commit')
    } catch (e: any) {
      await client.query('rollback').catch(() => {})
      logger.error('sendWorkDays', {data: loggerData, error: e})

      return NextResponse.json({message: e.message || ''}, {status: 500})
    } finally {
      client.release()
    }
  }

  return NextResponse.json(
    {
      warning: warnings.length
        ? `У сотрудников уже стоят смены в этот день: ${warnings.join(', ')}`
        : '',
    },
    {status: 200},
  )
}
