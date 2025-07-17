import {WorkerTimetable} from '@/src/utils/types'
import db from '@/lib/database'
import TimetablePage from '@/src/components/timetable/TimetablePage'

export default async function Timetable() {
  const query = `WITH worker_data AS (
    SELECT
      ls.worker_id,
      json_agg(
        json_build_object(
          'comment', ls.comment,
          'startTime', ls.start_time,
          'endTime', ls.end_time,
          'date', ls.date,
          'location', get_location(ls.location_id)
        ) ORDER BY ls.date
      ) AS data
    FROM lt_arena.locations_schedule ls
    WHERE ls.date BETWEEN (SELECT start_date FROM lt_arena.dates WHERE id = 2)
            AND (SELECT end_date FROM lt_arena.dates WHERE id = 2)
    GROUP BY ls.worker_id
    ), possibility_data AS (
      SELECT s.worker_id,
             json_agg(
               json_build_object(
                 'comment', s.comment,
                 'value', s.value,
                 'date', s.date
               ) ORDER BY s.date
             ) AS data
      FROM lt_arena.schedule s
      WHERE s.date BETWEEN (SELECT start_date FROM lt_arena.dates WHERE id = 2)
              AND (SELECT end_date FROM lt_arena.dates WHERE id = 2)
      GROUP BY s.worker_id
  )
SELECT
            get_worker(w.id) AS worker,
            wd.data AS data,
            pd.data as possibility_data
          FROM lt_arena.workers w 
          LEFT JOIN worker_data wd ON w.id = wd.worker_id
          LEFT JOIN lt_arena.ranks r ON r.name = w.rank
          LEFT JOIN possibility_data pd ON w.id = pd.worker_id
          ORDER BY w.is_former DESC, r.sorting_weight DESC, w.name`

  const result = await db.query(query)
  const rows: WorkerTimetable[] = result.rows

  const datesQuery = `SELECT start_date, end_date FROM lt_arena.dates WHERE id = 2`
  const datesResult = await db.query(datesQuery)
  const dates: [string, string] = [
    datesResult.rows[0].start_date.toFormat('yyyy-MM-dd'),
    datesResult.rows[0].end_date.toFormat('yyyy-MM-dd'),
  ]

  const locations = await db.query(`SELECT
                                               l.name,
                                               l.color,
                                               l.id
  FROM lt_arena.locations l
  WHERE l.name != 'Другое'
  ORDER BY l.name`)

  return (
    <main>
      <TimetablePage data={rows} dates={dates} locations={locations.rows} />
    </main>
  )
}
