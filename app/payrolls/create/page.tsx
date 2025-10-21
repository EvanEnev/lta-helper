import db from '@/lib/database'
import salarySort from '@/lib/functions/salarySort'
import {evaluate} from 'mathjs'
import PayrollCreatePage from '@/src/components/payrolls/create/PayrollCreatePage'
import getLocations from '@/lib/functions/getLocations'

interface PayrollsCreateProps {
  searchParams: Promise<{[key: string]: string | string[] | undefined}>
}

export default async function PayrollsCreate({
  searchParams,
}: PayrollsCreateProps) {
  const params = await searchParams
  const dates = JSON.parse(params?.dates as string)
  const moneyOnLocations = JSON.parse(params?.moneyOnLocations as string)
  const bonuses = JSON.parse(params?.bonuses as string)
  const workersBonusesRange: {start: string; end: string} = JSON.parse(
    params?.workersBonusesRange as string,
  )
  const actorsBonusesRange: {start: string; end: string} = JSON.parse(
    params?.actorsBonusesRange as string,
  )

  const query = `select
    w.name,
    w.id,
    w.rank,
    w.is_former,
    sum(value) +
    sum(coalesce(overwork, 0)) +
    sum(coalesce((one_games ->> 'value')::integer, 0)) +
    sum(coalesce((two_games ->> 'value')::integer, 0)) +
    sum(coalesce((three_games ->> 'value')::integer, 0)) +
    sum(coalesce((actor_games ->> 'value')::integer, 0)) as value,
    case
        when w.rank = 'Актёр' then (select string_agg(bonuses, '+') from lt_arena.salary where worker_id = w.id and date between '${actorsBonusesRange.start}' and '${actorsBonusesRange.end}')
        when w.rank != 'Актёр' and ${bonuses} then (select string_agg(bonuses, '+') from lt_arena.salary where worker_id = w.id and date between '${workersBonusesRange.start || '2025-01-01'}' and '${workersBonusesRange.end || '2025-01-01'}')  
      else '0'
    end as bonuses,
    case
      when w.rank = 'Актёр' then (select string_agg(fines, '+') from lt_arena.salary where worker_id = w.id and date between '${actorsBonusesRange.start}' and '${actorsBonusesRange.end}')
      when w.rank != 'Актёр' and ${bonuses} then (select string_agg(fines, '+') from lt_arena.salary where worker_id = w.id and date between '${workersBonusesRange.start || '2025-01-01'}' and '${workersBonusesRange.end || '2025-01-01'}')
      else '0'
      end as fines
    from lt_arena.salary
    left join lt_arena.workers w on w.id = worker_id
    where date between '${dates.start}' and '${dates.end}'
    group by w.name, w.rank, w.is_former, w.id`

  const balancesQuery = `select
  name,
  id,
  rank,
  is_former,
  balance
  from lt_arena.workers
  where balance is not null and balance != 0`

  const balancesResult = await db.query(balancesQuery)

  const result = await db.query(query)

  let data = salarySort(result.rows)

  data = data.map(row => {
    const newData = {...row}
    // @ts-ignore
    newData.bonuses = evaluate(newData.bonuses || '0')
    // @ts-ignore
    newData.fines = evaluate(newData.fines || '0')
    // @ts-ignore
    newData.value = Number(newData.value) || 0

    return newData
  })

  balancesResult.rows.forEach(row => {
    const index = data.findIndex(d => d.id === row.id)

    if (index === -1) {
      const newData = {
        name: row.name,
        id: row.id,
        rank: row.rank,
        isFormer: row.is_former,
        value: row.balance,
        bonuses: 0,
        fines: 0,
      }

      // @ts-ignore
      data.push(newData)
    } else {
      const newData = {...data[index]}

      // @ts-ignore
      newData.value = (Number(newData.value) || 0) + (Number(row.balance) || 0)
      data[index] = newData
    }
  })

  const locations = await getLocations()

  data.forEach(d => {
    // @ts-ignore
    if (typeof d.bonuses !== 'number' || typeof d.fines !== 'number') {
      console.debug(d)
    }
  })

  return (
    <PayrollCreatePage
      bonuses={bonuses || false}
      dates={dates}
      moneyOnLocations={moneyOnLocations}
      locations={locations}
      // @ts-ignore
      data={data}
    />
  )
}
