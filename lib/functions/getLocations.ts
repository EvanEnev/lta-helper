import db from '@/lib/database'
import {LTLocation} from '@/src/utils/types'

export default async function getLocations(): Promise<LTLocation[]> {
  const query = `SELECT
  name,
  color,
  id
  FROM lt_arena.locations`

  const result = await db.query(query)
  return result.rows
}
