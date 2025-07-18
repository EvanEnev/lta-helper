import {LTPoint, LTPointData, WorkerPoint} from '@/src/utils/types'
import {Interval} from 'luxon'
import db from '@/lib/database'

type data = {
  id: number
  points: {
    pointInfo: {id: number; name: string; description: string; value: number}
    isRequired: boolean
    maxValue: number
    data: {
      id: number
      value: number
      date: string
      comment: string | null
      createdBy: string
      createdAt: string
      isAboveLimit: boolean
    }[]
  }[]
}

interface GetPointsProps {
  interval: Interval
  workerId?: number
}

export default async function getPoints({
  interval,
  workerId,
}: GetPointsProps): Promise<WorkerPoint[]> {
  if (!(interval.start && interval.end)) {
    return []
  }

  const query = `
  WITH worker_points_data AS (
    SELECT
      wp.worker_id,
      json_agg(
        json_build_object(
          'id', p.id,
          'comment', wp.comment,
          'value', CASE WHEN wp.value IS NULL THEN p.value ELSE wp.value END,
          'createdBy', (SELECT name FROM lt_arena.workers WHERE id = wp.created_by),
          'date', wp.date,
          'createdAt', wp.created_at,
          'isAboveLimit', wp.is_above_limit 
        ) ORDER BY wp.date
      ) AS data
    FROM lt_arena.workers_points wp
    LEFT JOIN lt_arena.points p ON p.id = wp.point_id
    WHERE wp.date BETWEEN '${interval.start.toFormat('yyyy-MM-dd')}'
                          AND '${interval.end.toFormat('yyyy-MM-dd')}'
    ${workerId ? `AND wp.worker_id = ${workerId}` : ''}
    GROUP BY wp.worker_id
    ), points_data AS (
      SELECT
        w.id AS worker_id,
        json_agg(
           json_build_object(
               'pointInfo', json_build_object(
                            'id', p.id,
                            'name', p.name,
                            'description', p.description,
                            'value', p.value
                            ),
               'isRequired', rp.is_required,
                'maxValue', rp.max_value,
           'data', wp.data
           ) ORDER BY wp.data ->> 'date'
        ) AS data
      FROM lt_arena.workers w
      LEFT JOIN worker_points_data wp ON w.id = wp.worker_id
      LEFT JOIN lt_arena.points p ON p.id = (wp.data ->> 'id')::int
      LEFT JOIN lt_arena.ranks_points rp ON rp.rank_id = (SELECT id FROM lt_arena.ranks WHERE name = w.rank) AND rp.point_id = p.id
      ${workerId ? `WHERE wp.worker_id = ${workerId}` : ''}
      GROUP BY w.id
  )
        SELECT
            get_worker(w.id) AS worker,
            wp.data AS test,
            COALESCE(wp.data, '[]') AS points
          FROM lt_arena.workers w
          LEFT JOIN points_data wp ON w.id = wp.worker_id
          LEFT JOIN lt_arena.ranks r ON r.name = w.rank
          ${workerId ? `WHERE w.id = ${workerId}` : ''}
          ORDER BY w.is_former DESC, r.sorting_weight DESC, w.name
          `
  const result = await db.query(query)
  console.debug(result.rows.find(d => d.worker.name === 'Эван').points[0])
  return {}
}
