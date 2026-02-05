import db from '@/lib/database'
import {LTRank} from '@/src/utils/types'

export default async function getRanks(): Promise<LTRank[]> {
  const query = `SELECT
  id,
  name,
  salary,
  overwork,
  max_points,
  max_shift_points,
  weight
  FROM ranks`

  const result = await db.query(query)

  return result.rows.map(row => ({
    name: row.name,
    salary: row.salary,
    maxPoints: row.max_points,
    maxShiftPoints: row.max_shift_points,
    weight: row.weight,
    overwork: row.overwork,
  }))
}
