import {Worker} from '@/src/utils/types'

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

export default function sortByRank(array: Worker[]) {
  return array.sort((worker1, worker2) => {
    if (worker1.isFormer || !worker1.rank) {
      worker1.rank = 'Бывший'
    }

    if (worker2.isFormer || !worker2.rank) {
      worker2.rank = 'Бывший'
    }

    const ranksComparison =
      ranksMap[worker2.rank.toLowerCase()] -
      ranksMap[worker1.rank.toLowerCase()]

    if (ranksComparison !== 0) {
      return ranksComparison
    }

    return worker1.name.localeCompare(worker2.name)
  })
}
