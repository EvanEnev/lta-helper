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
  стажёр: 1,
  деревянный: 0,
  актёр: -1,
  оп: -2,
  бывший: -3,
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
