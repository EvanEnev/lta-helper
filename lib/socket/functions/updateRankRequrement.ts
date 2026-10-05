import {RankUpdateData, SocketUpdateProps} from '@/src/utils/types'

const toId = (value: unknown) => {
  const id = Number(value)

  return Number.isInteger(id) && id > 0 ? id : null
}

export default async function updateRankRequrement({
  data: incoming,
  client,
}: SocketUpdateProps) {
  const data: RankUpdateData = incoming

  const requirementId = toId(data?.id)
  const workerId = toId(data?.workerId)
  if (requirementId === null || workerId === null) return

  const generationId = toId(data.meta?.generationId)
  const questId = toId(data.meta?.questId)

  if (data.delete) {
    await client.query(
      'delete from relations.workers_requirements where requirement_id = $1 and worker_id = $2',
      [requirementId, workerId],
    )

    if (generationId !== null) {
      await client.query(
        'delete from relations.workers_generations where worker_id = $1 and generation_id = $2',
        [workerId, generationId],
      )
    }

    if (questId !== null) {
      await client.query(
        'delete from relations.workers_quests where worker_id = $1 and quest_id = $2',
        [workerId, questId],
      )
    }
    return
  }

  const value =
    data.value === null ||
    data.value === undefined ||
    !Number.isFinite(+data.value)
      ? null
      : Number(data.value)

  if (generationId !== null) {
    await client.query(
      'insert into relations.workers_generations (worker_id, generation_id) values ($1, $2) on conflict do nothing',
      [workerId, generationId],
    )
  }

  if (questId !== null) {
    await client.query(
      'insert into relations.workers_quests (worker_id, quest_id) values ($1, $2) on conflict do nothing',
      [workerId, questId],
    )
  }

  await client.query(
    `insert into relations.workers_requirements (requirement_id, worker_id, value)
     values ($1, $2, $3)
     on conflict (requirement_id, worker_id) do update set value = $3`,
    [requirementId, workerId, value],
  )
}
