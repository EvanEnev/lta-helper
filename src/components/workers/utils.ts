import type {LTWorkerData, RankUpdateData} from '@/src/utils/types'

export const fullName = (
  worker: Pick<LTWorkerData, 'lastName' | 'firstName' | 'middleName'>,
) =>
  [worker.lastName, worker.firstName, worker.middleName]
    .filter(Boolean)
    .join(' ')

// Тот же порядок, что в SQL страницы: сначала неподтверждённые, потом бывшие,
// дальше по рангу (старшие выше) и по имени
export const sortWorkers = (workers: LTWorkerData[]) =>
  [...workers].sort(
    (a, b) =>
      Number(a.isApproved) - Number(b.isApproved) ||
      Number(a.isFormer) - Number(b.isFormer) ||
      (b.rank.sortingWeight ?? 0) - (a.rank.sortingWeight ?? 0) ||
      a.name.localeCompare(b.name),
  )

// Обновление требования: и от сокета (в т.ч. удаление, когда приходит oldId),
// и оптимистично сразу после действия пользователя
export function applyRequirementUpdate(
  workers: LTWorkerData[],
  data: RankUpdateData,
) {
  const workerId = data.workerId || data.oldWorkerId
  const requirementId = data.id || data.oldId
  const isDelete = data.delete || !data.id

  return workers.map(worker => {
    if (worker.id !== workerId) return worker

    const index = worker.rankData.findIndex(req => req.id === requirementId)
    if (index === -1) return worker

    const req = worker.rankData[index]
    const next = isDelete
      ? {...req, done: false, value: null}
      : {
          ...req,
          value: req.type === 'check' ? null : data.value,
          done:
            req.type === 'check' ? true : (data.value ?? 0) >= (req.limit ?? 0),
        }

    const rankData = [...worker.rankData]
    rankData[index] = next

    return {...worker, rankData}
  })
}

export function matchesQuery(worker: LTWorkerData, query: string) {
  const text = query.trim().toLowerCase()
  if (!text) return true

  const digits = text.replace(/\D/g, '')

  return (
    worker.name.toLowerCase().includes(text) ||
    fullName(worker).toLowerCase().includes(text) ||
    String(worker.telegramId ?? '').includes(text) ||
    (digits.length > 1 &&
      (worker.phoneNumber ?? '').replace(/\D/g, '').includes(digits))
  )
}
