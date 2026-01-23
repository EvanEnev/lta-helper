import {SalaryData, SocketUpdateProps} from '@/src/utils/types'
import {DateTime} from 'luxon'

export default async function updateSalary({
  data: incoming,
  client,
}: SocketUpdateProps) {
  const data: SalaryData = incoming
  const loggerData: any = {}

  loggerData.data = data

  // @ts-ignore
  if (data.delete) {
    const query = `DELETE FROM salary.list
                WHERE
                    id = ${data.id}
                `

    loggerData.query = query
    // logger.info('Update user salary', {data: loggerData})
    console.log(loggerData)
    return await client.query(query)
  }

  const overworkStart =
    data.overworkStart === null ? 'NULL' : `'${data.overworkStart}'`

  const overworkEnd =
    data.overworkEnd === null ? 'NULL' : `'${data.overworkEnd}'`

  const date = DateTime.fromFormat(data.date, 'dd.MM.yyyy').toFormat(
    'yyyy-MM-dd',
  )
  const query = `UPDATE salary.list
                SET
                  value = ${data.value},
                    bonuses = '${data.bonuses}',
                    fines = '${data.fines}',
                    comment = '${data.comment}',
                    start_time = '${data.startTime}',
                    end_time = '${data.endTime}',
                    overwork_start = ${overworkStart},
                    overwork_end = ${overworkEnd},
                    ${data.oneGames ? `one_games = '${JSON.stringify(data.oneGames)}',` : ''}
                    ${data.twoGames ? `two_games = '${JSON.stringify(data.twoGames)}',` : ''}
                    ${data.threeGames ? `three_games = '${JSON.stringify(data.threeGames)}',` : ''}
                    ${data.actorGames ? `actor_games = '${JSON.stringify(data.actorGames)}',` : ''}
                  overwork = ${data.overworkValue || 'NULL'},
                    date = '${date}',
                    location_id = (SELECT id FROM locations WHERE id = ${data.location.id})                  
                    WHERE
                   id = ${data.id}
                `

  loggerData.query = query
  // logger.info('Update user salary', {data: loggerData})
  console.log(loggerData)

  await client.query(query)
}
