import {auth} from '@/lib/auth'
import {headers} from 'next/headers'
import {NextResponse} from 'next/server'
import db from '@/lib/database'
import {
  WrappedDeals,
  WrappedDealsType,
  WrappedLocations,
  WrappedSchedule,
  WrappedShifts,
  WrapperWorkers,
} from '@/src/utils/types'
import WrappedPage from '@/src/components/wrapped/WrappedPage-old'

export default async function Wrapped() {
  const {user: worker} = (await auth.api.getSession({
    headers: await headers(),
  })) || {user: null}

  if (!worker) {
    return NextResponse.redirect('/login')
  }

  const year = 2025

  const workersDataQuery = `select 
                                w.name as worker,
                                r.name as rank,
                                count(*) as count
                            from salary.list s1
                                join salary.list s2
                                on s1.date = s2.date 
                                and s1.worker_id != s2.worker_id
                                and s1.worker_id = ${worker.id}
                                and (
                                    (s1.start_time < s2.end_time and s1.end_time > s2.start_time)
                                    OR
                                    (s2.overwork_start is not null
                                     and s2.overwork_end is not null
                                     and s1.start_time < s2.overwork_end
                                     and s1.end_time > s2.overwork_start)
                                    OR
                                    (s1.overwork_start is not null
                                     and s1.overwork_end is not null
                                     and s1.overwork_start < s2.end_time
                                     and s1.overwork_end > s2.start_time)
                                    OR
                                    (s1.overwork_start is not null
                                     and s1.overwork_end is not null
                                     and s2.overwork_start is not null
                                     and s2.overwork_end is not null
                                     and s1.overwork_start < s2.overwork_end
                                     and s1.overwork_end > s2.overwork_start)
                                )
                                and s1.location_id = s2.location_id
                            left join workers w on w.id = s2.worker_id
                            left join ranks r on r.id = w.rank_id
                            where s1.location_id != 15 and extract(year from s1.date::date) = ${year}
                            group by w.name, r.name
                            order by count desc, w.name`

  const locationsQuery = `select l.name as location,
                                  count(*) as count
                          from salary.list s
                                 left join locations l on s.location_id = l.id
                          where worker_id = ${worker.id} and location_id != 15 and extract(year from date::date) = ${year}
                          group by location_id, l.name
                          order by count desc`

  const shiftsQuery = `select count(*) as count from salary.list where worker_id = ${worker.id} and location_id != 15 and extract(year from date::date) = ${year}`

  const scheduleQuery = `select 
    count(case when s1.value not in ('-', '+/-') then 1 end) as plus,
    count(case when s1.value = '-' then 1 end) as minus,
    count(case when s1.value = '+/-' then 1 end) as limitations,
    count(*) as count
from schedule.list s1
where s1.worker_id = ${worker.id} and extract(year from date::date) = ${year}`

  const dealsQuery = `select count(*) as count, count(case when t1.type = 'actor' then 1 end) as actor, count(case when t1.type = 'worker' then 1 end) as worker
from deals t1
where t1.worker_id = ${worker.id} and extract(year from t1.date::date) = ${year}`

  const dealsGamesTypesQuery = `select game_type as name, count(*) from deals where worker_id = ${worker.id}  and extract(year from date::date) = ${year} group by game_type  order by count desc`

  const workersDataResult = await db.query(workersDataQuery)
  const locationsResult = await db.query(locationsQuery)
  const shiftsResult = await db.query(shiftsQuery)
  const scheduleResult = await db.query(scheduleQuery)
  const dealsResult = await db.query(dealsQuery)
  const dealsGamesTypesResult = await db.query(dealsGamesTypesQuery)

  const workersData: WrapperWorkers[] = workersDataResult.rows
  const locationsData: WrappedLocations[] = locationsResult.rows
  const shiftsData: WrappedShifts = shiftsResult.rows[0]
  const scheduleData: WrappedSchedule = scheduleResult.rows[0]
  const dealsData: WrappedDeals = dealsResult.rows[0]
  const dealsGamesTypes: WrappedDealsType[] = dealsGamesTypesResult.rows

  console.debug(dealsData, dealsGamesTypes)

  return (
    <WrappedPage
      workersData={workersData}
      locationsData={locationsData}
      shiftsData={shiftsData}
      scheduleData={scheduleData}
      dealsData={dealsData}
      dealsGamesTypes={dealsGamesTypes}
    />
  )
}
