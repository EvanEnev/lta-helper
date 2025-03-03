const ranksMap: {[key: string]: number} = {
  советник: 8,
  платиновый: 7,
  золотой: 6,
  серебряный: 5,
  бронзовый: 4,
  железный: 3,
  каменный: 2,
  актёр: 1,
  актер: 1,
  клининг: 1,
  none: 0,
}

export default function sortByRanks(workers: any[]) {
  const sortedWorkers = workers
    .sort((worker1, worker2) => worker1.name.localeCompare(worker2.name))
    .sort(
      (worker1, worker2) =>
        ranksMap[(worker2.rank || 'none').toLowerCase()] -
        ranksMap[(worker1.rank || 'none').toLowerCase()],
    )

  return sortedWorkers
}
