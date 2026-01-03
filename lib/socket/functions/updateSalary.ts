import {SocketUpdateProps} from '@/src/utils/types'
import {DateTime} from 'luxon'

export default async function updateSalary({data, client}: SocketUpdateProps) {
  const loggerData: any = {}

  loggerData.data = data
  const date = DateTime.fromISO(data.date)

  if (data.delete) {
    const query = `DELETE FROM salary.list
                WHERE
                    date = '${date.toFormat('yyyy-MM-dd')}'
                    AND worker_id = ${data.worker_id}
                    AND location_id = (SELECT id FROM locations WHERE name = '${data.location.name}')
                `

    loggerData.query = query
    // logger.info('Update user salary', {data: loggerData})
    console.log(loggerData)
    return await client.query(query)
  }

  const overworkStart =
    data.overwork_start === null ? 'NULL' : `'${data.overwork_start}'`

  const overworkEnd =
    data.overwork_end === null ? 'NULL' : `'${data.overwork_end}'`

  const query = `UPDATE salary.list
                SET
                  value = ${data.value},
                    bonuses = '${data.bonuses}',
                    fines = '${data.fines}',
                    comment = '${data.comment}',
                    start_time = '${data.start_time}',
                    end_time = '${data.end_time}',
                    updated_by = ${data.updated_by},
                    overwork_start = ${overworkStart},
                    overwork_end = ${overworkEnd},
                    ${data.oneGames ? `one_games = '${JSON.stringify(data.oneGames)}',` : ''}
                    ${data.twoGames ? `two_games = '${JSON.stringify(data.twoGames)}',` : ''}
                    ${data.threeGames ? `three_games = '${JSON.stringify(data.threeGames)}',` : ''}
                    ${data.actorGames ? `actor_games = '${JSON.stringify(data.actorGames)}',` : ''}
                    overwork = ${data.overwork || 'NULL'}
                    ${data.newDate ? `, date = '${data.newDate}'` : ''}
                    ${data.newLocation ? `, location_id = (SELECT id FROM lt_arena.locations WHERE id = ${data.newLocation.id})` : ''}
                  
                    WHERE
                    date = '${date.toFormat('yyyy-MM-dd')}'
                    AND worker_id = ${data.worker_id}
                    AND location_id = (SELECT id FROM lt_arena.locations WHERE id = '${data.location.id}')
                `

  loggerData.query = query
  // logger.info('Update user salary', {data: loggerData})
  console.log(loggerData)

  await client.query(query)
}
