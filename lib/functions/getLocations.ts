import db from '@/lib/database'
import {LTLocation} from '@/src/utils/types'

export default async function getLocations(): Promise<LTLocation[]> {
  const query = `SELECT
  name,
  short_name as "shortName",
  color,
  id
  FROM locations
  order by name`

  const result = await db.query(query)
  return result.rows
}
