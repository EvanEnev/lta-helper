import checkPermissions from '@/lib/functions/checkPermissions'
import db from '@/lib/database'
import {UserSalary} from '@/src/utils/types'
import {DateTime} from 'luxon'
import {auth} from '@/lib/auth'
import {headers} from 'next/headers'

interface GetLocationSalaryDataProps {
  locationId?: number
  date: string | Set<string>
  allLocations?: boolean
}

export default async function getLocationSalaryData({
  locationId: selectedLocationId,
  date,
  allLocations = false,
}: GetLocationSalaryDataProps): Promise<UserSalary[]> {
  const {user: worker} = (await auth.api.getSession({
    headers: await headers(),
  })) || {user: null}

  const canView = checkPermissions(['view_salary'], worker)
  const canViewLocation = checkPermissions(['view_location_salary'], worker)
  const canViewFull = checkPermissions(['view_full_salary'], worker)

  if (typeof date === 'object') {
    date = Array.from(date)[0]
  }

  let data: UserSalary[] = []
  const currentDate = DateTime.fromFormat(date, 'yyyy-MM-dd')

  let workerId: number | null = worker?.id || -1
  let locationId: number | null = null

  if (canView) {
    if (allLocations) {
      workerId = null
    }

    if (!allLocations) {
      locationId = selectedLocationId || worker?.locationId || 2
    }

    if (canViewLocation && !allLocations) {
      workerId = null
      locationId = selectedLocationId || worker?.locationId || 2
    }

    if (canViewFull && !allLocations) {
      workerId = null
      locationId = selectedLocationId || worker?.locationId || 2
    }

    const query = `
      with params as (select ${worker?.id || null}::int                                       as current_worker,
                             ${workerId}::int                                               as worker_filter,
                             ${locationId}::int                                             as location_filter,
                             '${currentDate.startOf('month').toFormat('yyyy-MM-dd')}'::date as date_from,
                             '${currentDate.endOf('month').toFormat('yyyy-MM-dd')}'::date   as date_to),
           ranks_data as (select id, name, sorting_weight
                          from ranks),
           workers_data as (select id, name, first_name, rank_id, is_former, is_fired
                            from workers
                                   cross join params p
                            where coalesce(is_fired, false) = false
                              and (p.worker_filter is null or id = p.worker_filter)),
           locations as (select distinct s.location_id
                         from salary.list s
                                cross join params p
                         where s.date BETWEEN p.date_from and p.date_to
                           and (
                           (s.worker_id = p.current_worker
                             and (p.worker_filter is null or p.worker_filter = p.current_worker))
                             or ((p.worker_filter is null or s.worker_id = p.worker_filter)
                             and (p.location_filter is null or s.location_id = p.location_filter))
                           )),
           locations_face as (select distinct f.location_id
                              from face_id f
                                     cross join params p
                              where f.date BETWEEN p.date_from and p.date_to
                                and (
                                (f.worker_id = p.current_worker
                                  and (p.worker_filter is null or p.worker_filter = p.current_worker))
                                  or ((p.worker_filter is null or f.worker_id = p.worker_filter)
                                  and (p.location_filter is null or f.location_id = p.location_filter))
                                )),
           all_locations as (select distinct location_id
                             from locations
                             union
                             select distinct location_id
                             from locations_face),
           location_map as (select location_id, functions.get_location(location_id) as data
                            from all_locations),
           face_agg as (select f.worker_id,
                               f.date::date as f_date,
                               jsonb_agg(
                                 jsonb_build_object(
                                   'timestamp', to_char(f.date, 'DD.MM.YYYY HH24:MI:SS'),
                                   'location', lm.data
                                 ) order by f.date
                               )            as data
                        from face_id f
                               join location_map lm on lm.location_id = f.location_id
                               cross join params p
                        where f.date BETWEEN p.date_from and p.date_to
                          and (
                          (f.worker_id = p.current_worker
                            and (p.worker_filter is null or p.worker_filter = p.current_worker))
                            or ((p.worker_filter is null or f.worker_id = p.worker_filter)
                            and (p.location_filter is null or f.location_id = p.location_filter))
                          )
                        group by f.worker_id, f.date::date),
           salary_filtered AS (SELECT s.id,
                                      s.worker_id,
                                      s.date::date,
                                      s.start_time,
                                      s.end_time,
                                      s.overwork_start,
                                      s.overwork_end,
                                      s.value,
                                      s.overwork,
                                      s.bonuses,
                                      s.fines,
                                      s.comment,
                                      s.created_at,
                                      s.created_by,
                                      s.location_id,
                                      s.type,
                                      s.one_games,
                                      s.two_games,
                                      s.three_games,
                                      s.actor_games,
                                      s.work_types
                               FROM salary.list s
                                      CROSS JOIN params p
                               WHERE s.date BETWEEN p.date_from AND p.date_to
                                 and coalesce(s.is_confirmed, false) = true
                                 and (
                                 (s.worker_id = p.current_worker
                                   and (p.worker_filter is null or p.worker_filter = p.current_worker))
                                   or ((p.worker_filter IS NULL OR s.worker_id = p.worker_filter)
                                   and (p.location_filter IS NULL OR s.location_id = p.location_filter))
                                 )),
           payments_filtered AS (SELECT p.worker_id,
                                        p.date::date AS p_date,
                                        jsonb_agg(
                                          jsonb_build_object(
                                            'name', pt.name,
                                            'value', p.value,
                                            'comment', COALESCE(p.comment, ''),
                                            'act_id', p.act_id
                                          )
                                        )            AS payments
                                 FROM payments.list p
                                        JOIN payments.types pt ON pt.id = p.payment_type
                                        CROSS JOIN params pa
                                 WHERE p.date BETWEEN pa.date_from AND pa.date_to
                                   AND (pa.worker_filter IS NULL OR p.worker_id = pa.worker_filter)
                                 GROUP BY p.worker_id, p.date::date),
           salary_payments AS (SELECT coalesce(s.worker_id, p.worker_id) as worker_id,
                                      coalesce(s.date, p.p_date)         as date,
                                      s.id,
                                      s.start_time,
                                      s.end_time,
                                      s.overwork_start,
                                      s.overwork_end,
                                      s.value,
                                      s.overwork,
                                      s.bonuses,
                                      s.fines,
                                      s.comment,
                                      s.created_at,
                                      s.created_by,
                                      s.location_id,
                                      s.type,
                                      s.one_games,
                                      s.two_games,
                                      s.three_games,
                                      s.actor_games,
                                      s.work_types,
                                      COALESCE(p.payments, '[]'::jsonb)  AS payments
                               FROM salary_filtered s
                                      FULL JOIN payments_filtered p
                                                ON p.worker_id = s.worker_id
                                                  AND p.p_date = s.date)
      select jsonb_build_object(
               'id', w.id,
               'name', w.name,
               'firstName', w.first_name,
               'rank', r.name,
               'isFormer', coalesce(w.is_former, false)
             ) as worker,
             coalesce(
                 jsonb_agg(
                 jsonb_build_object(
                   'id', sp.id,
                   'date', to_char(sp.date, 'DD.MM.YYYY'),
                   'startTime', to_char(sp.start_time, 'HH24:MI'),
                   'endTime', to_char(sp.end_time, 'HH24:MI'),
                   'overworkStart', case when sp.overwork_start is not null then to_char(sp.overwork_start, 'HH24:MI') end,
                   'overworkEnd', case when sp.overwork_end is not null then to_char(sp.overwork_end, 'HH24:MI') end,
                   'value', coalesce(sp.value, 0),
                   'overworkValue', coalesce(sp.overwork, 0),
                   'bonuses', coalesce(sp.bonuses, '0'),
                   'fines', coalesce(sp.fines, '0'),
                   'comment', coalesce(sp.comment, ''),
                   'createdAt', to_char(sp.created_at, 'DD.MM.YYYY HH24:MI:SS'),
                   'createdBy', w_creator.name,
                   'location', case when sp.location_id IS NOT NULL THEN functions.get_location(sp.location_id) END,
                   'type', sp.type,
                   'oneGames', sp.one_games,
                   'twoGames', sp.two_games,
                   'threeGames', sp.three_games,
                   'actorGames', sp.actor_games,
                   'workTypes', sp.work_types,
                   'faceId', f.data,
                   'payments', sp.payments
                 )
                          ) filter (where sp.id is not null or sp.payments is not null),
                 '[]'::jsonb
             ) as dates
      from workers_data w
             left join ranks_data r on r.id = w.rank_id
             left join salary_payments sp on sp.worker_id = w.id
             left join workers w_creator on w_creator.id = sp.created_by
             left join location_map lm on lm.location_id = sp.location_id
             left join face_agg f on f.worker_id = w.id and f.f_date = sp.date
      group by w.id, w.name, w.first_name, w.is_former, r.name, r.sorting_weight
      order by coalesce(w.is_former, false), r.sorting_weight DESC, w.name, w.first_name
    `

    const results = await db.query(query)
    data = results.rows
  }

  return data
}
