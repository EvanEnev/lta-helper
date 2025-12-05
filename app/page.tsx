import MainPage from '@/src/components/page/MainPage'
import convertTZ from '@/lib/functions/convertTZ'
import db from '@/lib/database'
import {evaluate} from 'mathjs'
import {headers} from 'next/headers'
import {auth} from '@/lib/auth'
import {QueryResult} from 'pg'

export interface ShortSalary {
  currentDates: string
  currentSalary: number
  currentSalaryTakeDate: string
  previousDates: string
  previousSalary: number
  previousSalaryTakeDate: string
  bonuses: number
  fines: number
  currentBonuses: number
  previousBonuses: number
  currentFines: number
  previousFines: number
  balance: number | null
}

export default async function Home() {
  const {user: worker} = (await auth.api.getSession({
    headers: await headers(),
  })) || {user: {id: -1, rank: ''}}

  const date = convertTZ(new Date(), 'Europe/Moscow')

  const current = [date, date]
  const previous = [date, date]

  let currentSalaryTakeDate = ''
  let previousSalaryTakeDate = ''

  if (date.day < 5 || date.day >= 20) {
    if (date.day < 5) {
      current[0] = current[0].minus({month: 1})
      current[1] = current[1].minus({month: 1})

      previous[0] = previous[0].minus({month: 1})
      previous[1] = previous[1].minus({month: 1})
    }

    current[0] = current[0].set({day: 16})
    current[1] = current[1].set({
      day: current[1].endOf('month').day,
    })

    previous[0] = previous[0].set({day: 1})
    previous[1] = previous[1].set({day: 15})

    currentSalaryTakeDate = current[1]
      .plus({month: 1})
      .set({day: 5})
      .toFormat('dd.MM')
    previousSalaryTakeDate = previous[1].set({day: 20}).toFormat('dd.MM')
  }

  if (date.day >= 5 && date.day < 20) {
    current[0] = current[0].set({day: 1})
    current[1] = current[1].set({day: 15})

    previous[0] = previous[0].set({day: 16}).minus({month: 1})
    previous[1] = previous[1].minus({month: 1}).set({
      day: previous[1].minus({month: 1}).endOf('month').day,
    })

    currentSalaryTakeDate = current[1].set({day: 20}).toFormat('dd.MM')
    previousSalaryTakeDate = previous[1]
      .plus({month: 1})
      .set({day: 5})
      .toFormat('dd.MM')
  }

  const currentSalaryQuery = `
  SELECT (sum(value))::int as value, (sum(coalesce(overwork, 0)) +
    sum(coalesce((one_games ->> 'value')::int, 0)) +
    sum(coalesce((two_games ->> 'value')::int, 0)) +
    sum(coalesce((three_games ->> 'value')::int, 0)) +
    sum(coalesce((actor_games ->> 'value')::int, 0)))::int as overwork
  FROM lt_arena.salary
  WHERE worker_id = ${worker?.id}
  AND date BETWEEN '${current[0].toFormat('yyyy-MM-dd')}' AND '${current[1].toFormat('yyyy-MM-dd')}'`

  const previousSalaryQuery = `
  SELECT sum(value)::int as value, (sum(coalesce(overwork, 0)) +
                sum(coalesce((one_games ->> 'value')::int, 0)) +
                sum(coalesce((two_games ->> 'value')::int, 0)) +
                sum(coalesce((three_games ->> 'value')::int, 0)) +
                sum(coalesce((actor_games ->> 'value')::int, 0)))::int as overwork
  FROM lt_arena.salary
  WHERE worker_id = ${worker?.id}
  AND date BETWEEN '${previous[0].toFormat('yyyy-MM-dd')}' AND '${previous[1].toFormat('yyyy-MM-dd')}'`

  // @ts-ignore
  const results: [QueryResult<any>, QueryResult<any>] = await db.query(
    `${currentSalaryQuery}; ${previousSalaryQuery}`,
  )

  let currentSalary = results[0].rows[0].value + results[0].rows[0].overwork
  let previousSalary = results[1].rows[0].value + results[1].rows[0].overwork

  let bonuses = 0
  let fines = 0

  let bonusesQuery = `
    SELECT string_agg(bonuses, '+') as bonuses,string_agg(fines, '+') as fines
    FROM lt_arena.salary
    WHERE worker_id = ${worker?.id}`

  let addon
  let currentAddon = ` and date between '${current[0].startOf('month').toFormat('yyyy-MM-dd')}' and '${current[0].startOf('month').toFormat('yyyy-MM-dd')}'::date + interval '14 days'`
  let previousAddon = ` and date between '${previous[0].startOf('month').toFormat('yyyy-MM-dd')}'::date + interval '14 days' and '${previous[0].endOf('month').toFormat('yyyy-MM-dd')}'`
  if (currentSalaryTakeDate.startsWith('20')) {
    const month = current[0].minus({month: 1})

    addon = ` and extract(month from date) = ${month.month}`
  } else {
    const month = previous[0].minus({month: 1})

    addon = ` and extract(month from date) = ${month.month}`
  }

  const currentBonusesQuery = bonusesQuery + currentAddon
  const previousBonusesQuery = bonusesQuery + previousAddon

  bonusesQuery += addon

  const bonusesResult = await db.query(bonusesQuery)
  const currentBonusesResult = await db.query(currentBonusesQuery)
  const previousBonusesResult = await db.query(previousBonusesQuery)
  const bonusesData = bonusesResult.rows[0]
  const currentBonusesData = currentBonusesResult.rows[0]
  const previousBonusesData = previousBonusesResult.rows[0]

  fines += evaluate(bonusesData.fines || '0')
  bonuses += evaluate(bonusesData.bonuses || '0')

  const currentBonuses = evaluate(currentBonusesData.bonuses || '0')
  const previousBonuses = evaluate(previousBonusesData.bonuses || '0')

  const currentFines = evaluate(currentBonusesData.fines || '0')
  const previousFines = evaluate(previousBonusesData.fines || '0')

  const balanceQuery = `select balance from lt_arena.workers where id = ${worker?.id}`

  const balanceResult = await db.query(balanceQuery)

  const balance = balanceResult.rows[0]?.balance

  const salaryData: ShortSalary = {
    currentDates: `${current[0].toFormat('dd.MM')}-${current[1].toFormat('dd.MM')}`,
    currentSalary,
    previousDates: `${previous[0].toFormat('dd.MM')}-${previous[1].toFormat('dd.MM')}`,
    previousSalary,
    currentSalaryTakeDate,
    previousSalaryTakeDate,
    bonuses,
    fines,
    currentBonuses,
    previousBonuses,
    currentFines,
    previousFines,
    balance,
  }

  return <MainPage salaryData={salaryData} />
}
