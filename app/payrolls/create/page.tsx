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

  const query = `select
    w.name,
    w.id,
    w.rank,
    w.is_former,
    sum(value) + sum(coalesce(overwork, 0)) as value
    ${
      bonuses
        ? `,
    string_agg(bonuses, '+') as bonuses,
    string_agg(fines, '+') as fines`
        : ''
    }
    from lt_arena.salary
    left join lt_arena.workers w on w.id = worker_id
    where date between '${dates.start}' and '${dates.end}'
    group by w.name, w.rank, w.is_former, w.id`

  const result = await db.query(query)

  let data = salarySort(result.rows)

  if (bonuses) {
    data = data.map(row => {
      const newData = {...row}
      // @ts-ignore
      newData.bonuses = evaluate(newData.bonuses || '0')
      // @ts-ignore
      newData.fines = evaluate(newData.fines || '0')

      return newData
    })
  }

  const locations = await getLocations()

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
