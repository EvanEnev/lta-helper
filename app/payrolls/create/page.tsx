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
    r.name as rank,
    w.is_former,
    sum(value) +
    sum(coalesce(salary.list.overwork, 0)) +
    sum(coalesce((one_games ->> 'value')::integer, 0)) +
    sum(coalesce((two_games ->> 'value')::integer, 0)) +
    sum(coalesce((three_games ->> 'value')::integer, 0)) +
    sum(coalesce((actor_games ->> 'value')::integer, 0)) as value,
    case
        when r.name = 'Актёр' then (select string_agg(bonuses, '+') from salary.list where worker_id = w.id and date between '${actorsBonusesRange.start}' and '${actorsBonusesRange.end}')
        when r.name != 'Актёр' and ${bonuses} then (select string_agg(bonuses, '+') from salary.list where worker_id = w.id and date between '${workersBonusesRange.start || '2025-01-01'}' and '${workersBonusesRange.end || '2025-01-01'}')  
      else '0'
    end as bonuses,
    case
      when r.name = 'Актёр' then (select string_agg(fines, '+') from salary.list where worker_id = w.id and date between '${actorsBonusesRange.start}' and '${actorsBonusesRange.end}')
      when r.name != 'Актёр' and ${bonuses} then (select string_agg(fines, '+') from salary.list where worker_id = w.id and date between '${workersBonusesRange.start || '2025-01-01'}' and '${workersBonusesRange.end || '2025-01-01'}')
      else '0'
      end as fines
    from salary.list
    left join workers w on w.id = worker_id
    left join ranks r on r.id = w.rank_id
    where date between '${dates.start}' and '${dates.end}'
    group by w.name, r.sorting_weight, w.is_former, w.id, r.name`

  const balancesQuery = `select
  w.name,
  w.id,
  r.name as "rank",
  w.is_former,
  balance
  from workers w
  left join ranks r on r.id = w.rank_id
  where balance is not null and balance != 0`

  const bonusesQuery = `select
   w.name,
   w.id,
   r.name as "rank",
   w.is_former,
   string_agg(s.bonuses, '+') as bonuses,
   string_agg(s.fines, '+') as fines
   from salary.list s
   left join workers w on w.id = s.worker_id
   left join ranks r on r.id = w.rank_id
   where s.date between '${workersBonusesRange.start}' and '${workersBonusesRange.end}' and r.name != 'Актёр'
   group by w.name, w.is_former, w.id, r.name
  `

  const paymentsQuery = `select
  worker_id,
  sum(value)
  from payments.list
  where date between '${dates.start}' and '${dates.end}'
  group by worker_id`

  const paymentsResult = await db.query(paymentsQuery)
  const payments = paymentsResult.rows

  let data = (await db.query(query)).rows

  payments.forEach(payment => {
    const index = data.findIndex(d => d.id === payment.worker_id)
    if (index === -1) return

    const newData = {...data[index]}
    newData.externalPayment = Number(payment.sum)
    data[index] = newData
  })

  if (bonuses) {
    const bonusesResult = await db.query(bonusesQuery)

    bonusesResult.rows.forEach(row => {
      const index = data.findIndex(d => d.id === row.id)

      if (index === -1) {
        const newData = {
          name: row.name,
          id: row.id,
          rank: row.rank,
          isFormer: row.is_former,
          value: 0,
          bonuses: row.bonuses || '0',
          fines: row.fines || '0',
        }

        data.push(newData)
      }
    })
  }

  const balancesResult = await db.query(balancesQuery)

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

  data = data
    .map(row => {
      const newData = {...row}
      // @ts-ignore
      newData.bonuses = evaluate(newData.bonuses || '0')
      // @ts-ignore
      newData.fines = evaluate(newData.fines || '0')
      // @ts-ignore
      newData.value = Number(newData.value) || 0

      return newData
    })
    .filter(row => row.value !== 0 || row.bonuses !== 0 || row.fines !== 0)

  const sortedData = salarySort(data)

  return (
    <PayrollCreatePage
      bonuses={bonuses || false}
      dates={dates}
      moneyOnLocations={moneyOnLocations}
      locations={locations}
      // @ts-ignore
      data={sortedData}
    />
  )
}
