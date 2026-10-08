import type {RankRequirement} from '@/src/utils/types'

export const isRequirementDone = (req: RankRequirement) =>
  req.type === 'check' ? req.done : (req.value ?? 0) >= (req.limit ?? 0)

export interface GroupedRequirements {
  plain: RankRequirement[]
  categories: Record<string, RankRequirement[]>
}

export function groupRequirements(
  data: RankRequirement[],
): GroupedRequirements {
  const plain: RankRequirement[] = []
  const categories: Record<string, RankRequirement[]> = {}

  for (const req of data) {
    if (!req.category) {
      plain.push(req)
      continue
    }
    ;(categories[req.category] ??= []).push(req)
  }

  return {plain, categories}
}

export function getRankProgress(data: RankRequirement[]) {
  const {plain, categories} = groupRequirements(data)
  const categoryList = Object.values(categories)
  const choices = data.filter(req => req.meta?.isChoice)

  const plainDone = plain
    .filter(req => !req.meta?.isChoice)
    .every(isRequirementDone)
  const categoryDone =
    !categoryList.length || categoryList.some(c => c.every(isRequirementDone))
  const choiceDone = !choices.length || choices.some(isRequirementDone)

  return {
    done: data.length > 0 && plainDone && categoryDone && choiceDone,
    completed: data.filter(req => req.done).length,
    total: data.length,
  }
}
