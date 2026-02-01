import {RankUpdateData, SocketUpdateProps} from '@/src/utils/types'

export default async function updateRankRequrement({
  data: incoming,
  client,
}: SocketUpdateProps) {
  const data: RankUpdateData = incoming
  const loggerData: any = {}

  loggerData.data = data

  if (data.delete) {
    const query = `delete from relations.workers_requirements where requirement_id = ${data.id} and worker_id = ${data.workerId}`
    await client.query(query)

    if (data.meta?.generationId) {
      const query = `delete from relations.workers_generations where worker_id = ${data.workerId} and generation_id = ${data.meta.generationId}`
      await client.query(query)
    }

    if (data.meta?.questId) {
      const query = `delete from relations.workers_quests where worker_id = ${data.workerId} and quest_id = ${data.meta.questId}`
      await client.query(query)
    }
    return
  }

  const query = `insert into relations.workers_requirements (requirement_id, worker_id, value)
values (
        ${data.id},
        ${data.workerId},
        ${data.value}
       )
on conflict (requirement_id, worker_id) do update set value = ${data.value}`

  if (data.meta?.generationId) {
    const query = `insert into relations.workers_generations (worker_id, generation_id)
values (
        ${data.workerId},
        ${data.meta.generationId}
       )`

    await client.query(query)
  }

  if (data.meta?.questId) {
    let query = `insert into relations.workers_quests (worker_id, quest_id) values (${data.workerId}, ${data.meta.questId})`

    await client.query(query)
  }

  loggerData.query = query
  // logger.info('Update user salary', {data: loggerData})
  console.log(loggerData)

  await client.query(query)
}
