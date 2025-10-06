import {LTWorker} from '@/src/utils/types'

const ranksMap: {[key: string]: number} = {
  советник: 10,
  платиновый: 9,
  золотой: 8,
  серебряный: 7,
  бронзовый: 6,
  железный: 5,
  каменный: 4,
  техник: 3,
  стажёр: 2,
  деревянный: 1,
  актёр: 0,
  оп: -1,
  бывший: -2,
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
