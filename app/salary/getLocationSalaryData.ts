import checkPermissions from '@/lib/functions/checkPermissions'
import db from '@/lib/database'
import {UserSalary, Filter} from '@/src/utils/types'
import {DateTime} from 'luxon'
import {auth} from '@/lib/auth'
import {headers} from 'next/headers'

interface GetLocationSalaryDataProps {
  locationId?: number
  date: string | Set<string>
  allLocations?: boolean
  filters?: Filter[]
}

export default async function getLocationSalaryData({
  locationId: selectedLocationId,
  date,
  allLocations = false,
  filters = [],
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
  //
  // const currentYear = currentDate.year
  // const currentMonth = currentDate.month - 1
  // const daysInMonth = currentDate.daysInMonth || 1
  //
  // let workersRows = []
  // let faceIdRows = []
  // let salaryResult = {rows: []}
  // let paymentsRows = []

  let workerId = null
  let locationId = null

  if (canView) {
    let queryAddon = ''

    if (!allLocations) {
      locationId = selectedLocationId || worker?.locationId || 2
    }

    if (canViewLocation && !allLocations) {
      locationId = selectedLocationId || worker?.locationId || 2
    }

    if (canViewFull && !allLocations) {
      locationId = selectedLocationId || worker?.locationId || 2
    }

    //   if (filters?.length) {
    //     filters.forEach(filter => {
    //       if (typeof filter.value === 'number') {
    //         queryAddon += ` AND ${filter.key} = ${filter.value}`
    //       } else {
    //         queryAddon += ` AND ${filter.key} ILIKE '${filter.value}%'`
    //       }
    //     })
    //   }
    //
    //   const salaryQuery = `SELECT date::text,
    //                                   value,
    //                                   bonuses,
    //                                   fines,
    //                                   comment,
    //                                   created_at::text,
    //                                   start_time,
    //                                   end_time,
    //                                   overwork_start,
    //                                   overwork_end,
    //                                   overwork,
    //                                   w.name  AS worker_name,
    //                                   w.id AS worker_id,
    //                                   ws.name AS created_by,
    //                                   functions.get_location(l.id) AS location,
    //                                   s.type,
    //                                   s.one_games as "oneGames",
    //                                   s.two_games as "twoGames",
    //                                   s.three_games as "threeGames",
    //                                   s.actor_games as "actorGames",
    //                                   s.work_types
    //                            FROM salary.list s
    //                                     LEFT JOIN workers w ON w.id = s.worker_id
    //                                     LEFT JOIN workers ws ON ws.id = s.created_by
    //                                     LEFT JOIN locations l ON l.id = s.location_id
    //                        WHERE date BETWEEN '${currentDate.startOf('month').toFormat('yyyy-MM-dd')}' AND '${currentDate.endOf('month').toFormat('yyyy-MM-dd')}'
    //                                ${queryAddon}`
    //
    //   const paymentsQuery = `select
    //   worker_id,
    //   pt.name,
    //   p.value,
    //   date,
    //   comment,
    //   act_id
    //   from payments.list p
    //   left join payments.types pt on pt.id = p.payment_type`
    //
    //   const workersQuery = `
    //   SELECT
    //   w.id, w.name, first_name as "firstName", r.name as rank, telegram_id as "telegramId", is_former as "isFormer"
    //   FROM workers w
    //   left join ranks r on r.id = w.rank_id
    //   ${!(canViewFull || canViewLocation) ? `where w.name ilike '${worker?.name}'` : ''}
    //   order by w.is_former desc, r.sorting_weight desc, w.name`
    //
    //   const results = await db.query(
    //     `${salaryQuery};\n${workersQuery};\n${paymentsQuery}`,
    //   )
    //
    //   // @ts-ignore
    //   const workersResult = results[1]
    //   // @ts-ignore
    //   salaryResult = results[0]
    //   // @ts-ignore
    //   const paymentsResult = results[2]
    //   paymentsRows = paymentsResult.rows
    //
    //   workersRows = workersResult.rows
    //
    //   const faceIdQuery = `select
    //                        worker_id as "workerId",
    //                        json_agg(
    //                          json_build_object(
    //                            'location', functions.get_location(location_id),
    //                            'date', date::text
    //                          )
    //                        ) as data
    //                      from face_id
    //                      where extract(month from date) = ${DateTime.fromISO(date).month}
    //                      group by worker_id`
    //
    //   const faceIdResult = await db.query(faceIdQuery)
    //   faceIdRows = faceIdResult.rows
    // }
    //
    // const salaryData: SalaryData[] = salaryResult.rows
    //
    // const data: UserSalary[] = workersRows.map((worker: any) => {
    //   const row: UserSalary = {
    //     worker: {
    //       id: worker.id,
    //       name: worker.name,
    //       firstName: worker.firstName,
    //       rank: worker.rank,
    //       isFormer: worker.isFormer || false,
    //     },
    //     dates: [],
    //   }
    //
    //   for (let day = 1; day <= daysInMonth; day++) {
    //     const date = convertTZ(
    //       new Date(currentYear, currentMonth, day),
    //       'Europe/Moscow',
    //     )
    //
    //     const salary: SalaryData | undefined = salaryData.find(
    //       s =>
    //         s.date === date.toFormat('yyyy-MM-dd') &&
    //         s.worker_name === worker.name,
    //     )
    //
    //     const payment = paymentsRows.find(
    //       (p: any) =>
    //         p.worker_id === worker.id &&
    //         p.date.toFormat('yyyy-MM-dd') === date.toFormat('yyyy-MM-dd'),
    //     )
    //
    //     let obj: string | SalaryData = ''
    //
    //     if (!(salary || payment)) {
    //       obj = ''
    //     } else {
    //       // @ts-ignore
    //       obj = {
    //         ...salary,
    //         // @ts-ignore
    //         payment: payment
    //           ? {...payment, date: payment?.date.toISO() || ''}
    //           : null,
    //         date: date.toISO() || '',
    //       }
    //     }
    //
    //     if (payment !== undefined) {
    //       console.debug(payment, obj)
    //     }
    //
    //     rowWithDates[`day${day}`] = obj
    //   }
    //
    //   return rowWithDates
    // })

    const query = `
    with params as (
      select
        ${workerId}::int as worker_filter,
        ${locationId}::int as location_filter,
        '${currentDate.startOf('month').toFormat('yyyy-MM-dd')}'::date as date_from,
        '${currentDate.endOf('month').toFormat('yyyy-MM-dd')}'::date as date_to
    ),
         ranks_data as (
           select id, name, sorting_weight from ranks
         ),
         workers_data as (
           select id, name, first_name, rank_id, is_former, is_fired
           from workers
                  cross join params p
           where coalesce(is_fired, false) = false
             and (p.worker_filter is null or id = p.worker_filter)
         ),
         locations as (
           select distinct s.location_id
           from salary.list s
                  cross join params p
           where s.date BETWEEN p.date_from and p.date_to
             and (p.worker_filter is null or s.worker_id = p.worker_filter)
             and (p.location_filter is null or s.location_id = p.location_filter)
         ),
         locations_face as (
           select distinct f.location_id
           from face_id f
                  cross join params p
           where f.date BETWEEN p.date_from and p.date_to
             and (p.worker_filter is null or f.worker_id = p.worker_filter)
             and (p.location_filter is null or f.location_id = p.location_filter)
         ),
         all_locations as (
           select distinct location_id from locations
           union
           select distinct location_id from locations_face
         ),
         location_map as (
           select location_id, functions.get_location(location_id) as data
           from all_locations
         ),
         face_agg as (
           select
             f.worker_id,
             f.date::date as f_date,
             jsonb_agg(
                jsonb_build_object(
                    'timestamp', to_char(f.date, 'DD.MM.YYYY HH24:MI:SS'),
                    'location', lm.data
                )
             ) as data
           from face_id f
                  join location_map lm on lm.location_id = f.location_id
                  cross join params p
           where f.date BETWEEN p.date_from and p.date_to
             and (p.worker_filter is null or f.worker_id = p.worker_filter)
             and (p.location_filter is null or f.location_id = p.location_filter)
           group by f.worker_id, f.date::date
         ),
         payments_agg as (
           select
             p.worker_id,
             p.date as p_date,
             jsonb_agg(
               jsonb_build_object(
                 'name', (select name from payments.types where id = p.payment_type),
                 'value', p.value,
                 'comment', coalesce(p.comment, ''),
                 'act_id', p.act_id
               )
             ) as data
           from payments.list p
                  cross join params param
           where p.date BETWEEN param.date_from and param.date_to
             and (param.worker_filter is null or p.worker_id = param.worker_filter)
           group by p.worker_id, p.date::date
         ),
         salary_filtered AS (
           SELECT
             s.id,
             s.worker_id,
             s.date::date,
             s.start_time, s.end_time,
             s.overwork_start, s.overwork_end,
             s.value, s.overwork, s.bonuses, s.fines,
             s.comment,
             s.created_at, s.created_by,
             s.location_id,
             s.type,
             s.one_games, s.two_games, s.three_games, s.actor_games,
             s.work_types
           FROM salary.list s
                  CROSS JOIN params p
           WHERE s.date BETWEEN p.date_from AND p.date_to
             AND (p.worker_filter   IS NULL OR s.worker_id   = p.worker_filter)
             AND (p.location_filter IS NULL OR s.location_id = p.location_filter)
         ), payments_filtered AS (
      SELECT
        p.worker_id,
        p.date::date AS p_date,
        jsonb_agg(
          jsonb_build_object(
            'name', pt.name,
            'value', p.value,
            'comment', COALESCE(p.comment, ''),
            'act_id', p.act_id
          )
        ) AS payments
      FROM payments.list p
             JOIN payments.types pt ON pt.id = p.payment_type
             CROSS JOIN params pa
      WHERE p.date BETWEEN pa.date_from AND pa.date_to
        AND (pa.worker_filter IS NULL OR p.worker_id = pa.worker_filter)
      GROUP BY p.worker_id, p.date::date
    ), salary_payments AS (
      SELECT
        COALESCE(s.worker_id, p.worker_id) AS worker_id,
        COALESCE(s.date, p.p_date)         AS date,

        s.id,
        s.start_time, s.end_time,
        s.overwork_start, s.overwork_end,
        s.value, s.overwork,
        s.bonuses, s.fines,
        s.comment,
        s.created_at, s.created_by,
        s.location_id,
        s.type,
        s.one_games, s.two_games, s.three_games, s.actor_games,
        s.work_types,

        -- payments
        COALESCE(p.payments, '[]'::jsonb) AS payments
      FROM salary_filtered s
             FULL JOIN payments_filtered p
                       ON p.worker_id = s.worker_id
                         AND p.p_date    = s.date
    )
    select
      jsonb_build_object(
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
