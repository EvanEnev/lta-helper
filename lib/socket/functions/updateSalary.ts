import {SalaryData, SocketUpdateProps} from '@/src/utils/types'
import {DateTime} from 'luxon'

const toId = (value: unknown) => {
  const id = Number(value)

  return Number.isInteger(id) && id > 0 ? id : null
}

export default async function updateSalary({
  data: incoming,
  client,
}: SocketUpdateProps) {
  const data: SalaryData = incoming

  const id = toId(data?.id)
  if (id === null) return

  // @ts-ignore
  if (data.delete) {
    await client.query('DELETE FROM salary.list WHERE id = $1', [id])
    return
  }

  const date = DateTime.fromFormat(data.date, 'dd.MM.yyyy')
  const locationId = toId(data.location?.id)
  if (!date.isValid || locationId === null) return

  const values: unknown[] = []
  const sets: string[] = []
  const set = (column: string, value: unknown) => {
    values.push(value)
    sets.push(`${column} = $${values.length}`)
  }

  set('value', data.value)
  set('bonuses', data.bonuses)
  set('fines', data.fines)
  set('comment', data.comment)
  set('start_time', data.startTime)
  set('end_time', data.endTime)
  set('overwork_start', data.overworkStart ?? null)
  set('overwork_end', data.overworkEnd ?? null)

  if (data.oneGames) set('one_games', JSON.stringify(data.oneGames))
  if (data.twoGames) set('two_games', JSON.stringify(data.twoGames))
  if (data.threeGames) set('three_games', JSON.stringify(data.threeGames))
  if (data.actorGames) set('actor_games', JSON.stringify(data.actorGames))

  set('overwork', data.overworkValue || null)
  set('date', date.toFormat('yyyy-MM-dd'))

  values.push(locationId)
  sets.push(
    `location_id = (SELECT id FROM locations WHERE id = $${values.length})`,
  )

  values.push(id)

  await client.query(
    `UPDATE salary.list SET ${sets.join(', ')} WHERE id = $${values.length}`,
    values,
  )
}
