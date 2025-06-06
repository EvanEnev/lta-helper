import {LTWorker} from '@/src/utils/types'

const ranksMap: {[key: string]: number} = {
  советник: 9,
  платиновый: 8,
  золотой: 7,
  серебряный: 6,
  бронзовый: 5,
  железный: 4,
  каменный: 3,
  стажёр: 2,
  актёр: 1,
  бывший: 0,
}

export default function sortByRank(
  array: LTWorker[] | Omit<LTWorker, 'permissions' | 'permissionLevel'>[],
) {
  return array.sort((worker1, worker2) => {
    let rank1 = worker1.rank
    let rank2 = worker2.rank

    if (worker1.isFormer || !rank1) {
      rank1 = 'Бывший'
    }

    if (worker2.isFormer || !rank2) {
      rank2 = 'Бывший'
    }

    return (
      ranksMap[rank2.toLowerCase().trim()] -
        ranksMap[rank1.toLowerCase().trim()] ||
      worker1.name.localeCompare(worker2.name)
    )
  })
}
