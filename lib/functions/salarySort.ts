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
  деревянный: 1,
  актёр: 0,
  оп: -1,
  бывший: -2,
}

export default function salarySort(
  array: LTWorker[] | Omit<LTWorker, 'permissions' | 'permissionLevel'>[],
) {
  const actors = array.filter(d => ranksMap[d.rank.toLowerCase().trim()] < 3)
  const others = array.filter(d => ranksMap[d.rank.toLowerCase().trim()] >= 3)

  const othersSorted = others.sort((worker1, worker2) => {
    return worker1.name.localeCompare(worker2.name)
  })

  const actorsSorted = actors.sort((worker1, worker2) => {
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

  return [...othersSorted, ...actorsSorted]
}
