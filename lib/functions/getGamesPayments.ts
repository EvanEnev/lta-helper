import db from '@/lib/database'
import {LTGamePayment} from '@/src/utils/types'

export default async function getGamesPayments(): Promise<LTGamePayment[]> {
  const query = `select
  id,
  name,
  description,
  value,
  rank,
  key,
  konsol_id
  from salary.games_payments
  order by id`

  const result = await db.query(query)

  return result.rows
}
