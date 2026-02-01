import {RankUpdateData, SocketUpdateProps} from '@/src/utils/types'

export default async function updateRankRequrement({
  data: incoming,
  client,
}: SocketUpdateProps) {
  const data: RankUpdateData = incoming
  const loggerData: any = {}

  loggerData.data = data

  console.debug(data)
  if (data.delete) {
    const query = `delete from relations.workers_requirements where requirement_id = ${data.id} and worker_id = ${data.workerId}`
    console.debug(query)
    await client.query(query)
    return
  }

  const query = `insert into relations.workers_requirements (requirement_id, worker_id, value)
values (
        ${data.id},
        ${data.workerId},
        ${data.value}
       )
on conflict (requirement_id, worker_id) do update set value = ${data.value}`

  loggerData.query = query
  // logger.info('Update user salary', {data: loggerData})
  console.log(loggerData)

  await client.query(query)
}
