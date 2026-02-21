import db from '@/lib/database'
import {LTRank} from '@/src/utils/types'

interface GetRanksProps {
  addon?: string
}

export default async function getRanks(
  {addon = ''}: GetRanksProps = {addon: ''},
): Promise<LTRank[]> {
  const query = `SELECT
  id,
  name,
  salary,
  overwork,
  max_points,
  max_shift_points,
  weight
  FROM ranks
  ${addon}`

  const result = await db.query(query)

  return result.rows.map(row => ({
    id: row.id,
    name: row.name,
    salary: row.salary,
    maxPoints: row.max_points,
    maxShiftPoints: row.max_shift_points,
    weight: row.weight,
    overwork: row.overwork,
  }))
}
