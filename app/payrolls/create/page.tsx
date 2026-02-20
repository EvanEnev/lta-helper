import db from '@/lib/database'
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
                   w.id,
                   w.name,
                   r.name as rank,
                   coalesce(w.is_former, false) as "isFormer",
                   s.*
                 from workers w
                        join ranks r on w.rank_id = r.id
                        cross join lateral functions.get_salary(w.id,
                                                                '${dates.start}'::date,
                                                                '${dates.end}'::date,
                                                                case when r.id = 12 then '${actorsBonusesRange.start}'::date
                                                                     else '${workersBonusesRange.start || '2025-01-01'}'::date end,
                                                                case when r.id = 12 then '${actorsBonusesRange.end}'::date
                                                                     else '${workersBonusesRange.end || '2025-01-01'}'::date end
                                           ) s
                 where s.sum != 0
                 order by coalesce(w.is_former, false), r.id != 12 desc, w.name`

  const locations = await getLocations()

  const data = (await db.query(query)).rows

  return (
    <PayrollCreatePage
      bonuses={bonuses || false}
      dates={dates}
      moneyOnLocations={moneyOnLocations}
      locations={locations}
      data={data}
    />
  )
}
