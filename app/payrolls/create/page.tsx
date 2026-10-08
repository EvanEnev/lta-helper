import {redirect} from 'next/navigation'
import {headers} from 'next/headers'
import db from '@/lib/database'
import PayrollCreatePage from '@/src/components/payrolls/create/PayrollCreatePage'
import getLocations from '@/lib/functions/getLocations'
import checkPermissions from '@/lib/functions/checkPermissions'
import {auth} from '@/lib/auth'
import {isDate} from '@/lib/payrolls/validate'

interface PayrollsCreateProps {
  searchParams: Promise<{[key: string]: string | string[] | undefined}>
}

const parse = <T,>(value: string | string[] | undefined): T | null => {
  if (typeof value !== 'string') return null

  try {
    return JSON.parse(value) as T
  } catch {
    return null
  }
}

const range = (
  value: unknown,
): {start: string | null; end: string | null} | null => {
  const r = value as {start?: unknown; end?: unknown} | null
  if (!r || typeof r !== 'object') return null

  const start = r.start ?? null
  const end = r.end ?? null

  if ((start !== null && !isDate(start)) || (end !== null && !isDate(end))) {
    return null
  }

  return {start: start as string | null, end: end as string | null}
}

export default async function PayrollsCreate({
  searchParams,
}: PayrollsCreateProps) {
  const session = await auth.api.getSession({headers: await headers()})

  if (!session?.user || !checkPermissions(['edit_payrolls'], session.user)) {
    redirect('/payrolls')
  }

  const params = await searchParams

  const dates = parse<{start: string; end: string}>(params?.dates)
  const bonuses = parse<boolean>(params?.bonuses)
  const moneyOnLocations = parse<{location: number; value: number}[]>(
    params?.moneyOnLocations,
  )
  const workersBonusesRange = range(parse(params?.workersBonusesRange))
  const actorsBonusesRange = range(parse(params?.actorsBonusesRange))

  if (
    !dates ||
    !isDate(dates.start) ||
    !isDate(dates.end) ||
    !workersBonusesRange ||
    !actorsBonusesRange?.start ||
    !actorsBonusesRange.end
  ) {
    redirect('/payrolls')
  }

  const query = `select
                   w.id,
                   w.name,
                   w.last_name || ' ' || w.first_name as fio,
                   r.name as rank,
                   coalesce(w.is_former, false) as "isFormer",
                   s.*
                 from workers w
                        join ranks r on w.rank_id = r.id
                        cross join lateral functions.get_salary(w.id,
                                                                $1::date,
                                                                $2::date,
                                                                case when r.id = 12 then $3::date else $4::date end,
                                                                case when r.id = 12 then $5::date else $6::date end
                                           ) s
                 where s.count != 0 or s.balance != 0 or s.bonuses != 0 or s.fines != 0
                 order by coalesce(w.is_former, false), r.id != 12 desc, w.name`

  const locations = await getLocations()

  const data = (
    await db.query(query, [
      dates.start,
      dates.end,
      actorsBonusesRange.start,
      workersBonusesRange.start,
      actorsBonusesRange.end,
      workersBonusesRange.end,
    ])
  ).rows

  return (
    <PayrollCreatePage
      bonuses={bonuses || false}
      dates={dates}
      moneyOnLocations={Array.isArray(moneyOnLocations) ? moneyOnLocations : []}
      locations={locations}
      data={data}
      workersBonusesRange={workersBonusesRange as {start: string; end: string}}
    />
  )
}
