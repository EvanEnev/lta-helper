import MainPage from '@/src/components/page/MainPage'
import convertTZ from '@/lib/functions/convertTZ'
import db from '@/lib/database'
import {evaluate} from 'mathjs'
import {headers} from 'next/headers'
import {auth} from '@/lib/auth'
import {QueryResult} from 'pg'
import getWorkingDays from '@/lib/functions/getWorkingDays'
import {RankDescription, RankRequirement} from '@/src/utils/types'

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
  const worker = (await auth.api.getSession({
    headers: await headers(),
  }))!.user

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
  FROM salary.list
  WHERE worker_id = ${worker?.id}
  AND date BETWEEN '${current[0].toFormat('yyyy-MM-dd')}' AND '${current[1].toFormat('yyyy-MM-dd')}'`

  const previousSalaryQuery = `
  SELECT sum(value)::int as value, (sum(coalesce(overwork, 0)) +
                sum(coalesce((one_games ->> 'value')::int, 0)) +
                sum(coalesce((two_games ->> 'value')::int, 0)) +
                sum(coalesce((three_games ->> 'value')::int, 0)) +
                sum(coalesce((actor_games ->> 'value')::int, 0)))::int as overwork
  FROM salary.list
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
    FROM salary.list
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

  const balanceQuery = `select balance from workers where id = ${worker?.id}`

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

  const ranksQuery = `
    select
      functions.get_rank(r.id) as rank,
      case when rr.rank_id is not null then jsonb_agg(jsonb_build_object(
        'id',rr.id,
        'name', rr.name,
        'description', description,
        'limit', "limit",
        'type',type,
        'category', category,
        'value', wr.value,
        'done', (case when rr.type = 'number' then (coalesce(wr.value >= "limit", false)) else (wr.id is not null) end)
        )) else '[]'::jsonb end as data
    from ranks r
           left join ranks.requirements rr on rr.rank_id = r.id
           left join relations.workers_requirements wr on rr.id = wr.requirement_id and worker_id = ${worker.id}
    where r.id not in (13, 14)
    group by r.id, r.sorting_weight, rr.rank_id
    order by r.sorting_weight desc`

  const ranksResult = await db.query(ranksQuery)
  const ranksData: RankDescription[] = ranksResult.rows

  const workingDays = await getWorkingDays({telegramId: worker.telegramId})
  return (
    <MainPage
      ranksData={ranksData}
      worker={worker}
      // @ts-ignore
      workingDays={workingDays}
      salaryData={salaryData}
    />
  )
}
