import MainPage from '@/src/components/page/MainPage'
import convertTZ from '@/lib/functions/convertTZ'
import db from '@/lib/database'
import {headers} from 'next/headers'
import {auth} from '@/lib/auth'
import getWorkingDays from '@/lib/functions/getWorkingDays'
import {RankDescription} from '@/src/utils/types'

interface SalaryData {
  sum: number
  value: number
  fines: number
  bonuses: number
  balance: number
  overwork: number
  games: number
  external: number
}

export interface ShortSalary {
  currentDates: string
  currentSalary: number
  currentSalaryTakeDate: string
  previousDates: string
  previousSalary: number
  previousSalaryTakeDate: string
  currentBonuses: number
  previousBonuses: number
  currentFines: number
  previousFines: number
  balance: number
  currentSum: number
  previousSum: number
  currentExternal: number
  previousExternal: number
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

  if (date.day < 10 || date.day >= 25) {
    if (date.day < 10) {
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
      .set({day: 10})
      .toFormat('dd.MM')
    previousSalaryTakeDate = previous[1].set({day: 25}).toFormat('dd.MM')
  }

  if (date.day >= 10 && date.day < 25) {
    current[0] = current[0].set({day: 1})
    current[1] = current[1].set({day: 15})

    previous[0] = previous[0].set({day: 16}).minus({month: 1})
    previous[1] = previous[1].minus({month: 1}).set({
      day: previous[1].minus({month: 1}).endOf('month').day,
    })

    currentSalaryTakeDate = current[1].set({day: 25}).toFormat('dd.MM')
    previousSalaryTakeDate = previous[1]
      .plus({month: 1})
      .set({day: 10})
      .toFormat('dd.MM')
  }

  let currentDates: [string | null, string | null] = [null, null]
  let previousDates: [string | null, string | null] = [null, null]

  if (worker.rank === 'Актёр') {
    currentDates = [
      `'${current[0].startOf('month').toFormat('yyyy-MM-dd')}'::date`,
      `('${current[0].startOf('month').toFormat('yyyy-MM-dd')}'::date + interval '14 days')::date`,
    ]

    previousDates = [
      `('${previous[0].startOf('month').toFormat('yyyy-MM-dd')}'::date + interval '14 days')::date`,
      `'${previous[0].endOf('month').toFormat('yyyy-MM-dd')}'::date`,
    ]
  } else {
    if (currentSalaryTakeDate.startsWith('20')) {
      const month = current[0].minus({month: 1})

      currentDates = [
        `'${month.startOf('month').toFormat('yyyy-MM-dd')}'::date`,
        `'${month.endOf('month').toFormat('yyyy-MM-dd')}'::date`,
      ]
    } else {
      const month = previous[0].minus({month: 1})

      previousDates = [
        `'${month.startOf('month').toFormat('yyyy-MM-dd')}'::date`,
        `'${month.endOf('month').toFormat('yyyy-MM-dd')}'::date`,
      ]
    }
  }

  const currentQuery = `
    select * from functions.get_salary(${worker?.id}, '${current[0].toFormat('yyyy-MM-dd')}', '${current[1].toFormat('yyyy-MM-dd')}', ${currentDates[0]}, ${currentDates[1]})
  `

  const previousQuery = `
  select * from functions.get_salary(${worker?.id}, '${previous[0].toFormat('yyyy-MM-dd')}', '${previous[1].toFormat('yyyy-MM-dd')}', ${previousDates[0]},  ${previousDates[1]})
  `

  const currentSalaryResult = await db.query(currentQuery)
  const previousSalaryResult = await db.query(previousQuery)

  const currentSalaryData: SalaryData = currentSalaryResult.rows[0]
  const previousSalaryData: SalaryData = previousSalaryResult.rows[0]

  const salaryData: ShortSalary = {
    currentDates: `${current[0].toFormat('dd.MM')}-${current[1].toFormat('dd.MM')}`,
    currentSalary:
      currentSalaryData.value +
      currentSalaryData.overwork +
      currentSalaryData.games,
    previousDates: `${previous[0].toFormat('dd.MM')}-${previous[1].toFormat('dd.MM')}`,
    previousSalary:
      previousSalaryData.value +
      previousSalaryData.overwork +
      previousSalaryData.games,
    currentSalaryTakeDate,
    previousSalaryTakeDate,
    currentBonuses: currentSalaryData.bonuses,
    previousBonuses: previousSalaryData.bonuses,
    currentFines: currentSalaryData.fines,
    previousFines: previousSalaryData.fines,
    balance: currentSalaryData.balance,
    currentSum: currentSalaryData.sum,
    previousSum: previousSalaryData.sum,
    currentExternal: currentSalaryData.external,
    previousExternal: previousSalaryData.external,
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

  const workingDays = await getWorkingDays({id: worker.id})

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
