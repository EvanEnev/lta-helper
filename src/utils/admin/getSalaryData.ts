import {evaluate} from 'mathjs'
import ranksSalary from '../ranksSalary'

type SalaryData = {
  worker: string
  rank: string
  workingHours: string
  isHardTime: boolean
  gamesCount: number
  comment: string
  bonuses: string
}

export default function getSalaryData(data: SalaryData) {
  const rank: string = data.rank.toLowerCase()
  const gamesCount = data.gamesCount || 1

  let workingTimeParts: string[] | number[] = data.workingHours.split('-')
  if (workingTimeParts.length < 2) return

  workingTimeParts = workingTimeParts.map(v => parseInt(v))

  if (workingTimeParts[1] < 12) {
    workingTimeParts[1] += 24
  }

  let salary = ranksSalary[rank].default

  if (data.comment?.toLowerCase().includes('под игру')) {
    salary = 1500
  }

  const workingTime = workingTimeParts[1] - workingTimeParts[0]

  const overWorkTime = workingTime - (data.isHardTime ? 8 : 9)
  const isOverWork = overWorkTime > 0 && rank !== 'актёр'

  let calculatedWorkingTime: string
  let calculatedOverWorkTime: string = ''

  if (data.isHardTime && isOverWork) {
    calculatedWorkingTime = `${workingTimeParts[0]}-${
      workingTimeParts[0] + 8 || ''
    }`
    calculatedOverWorkTime = `${workingTimeParts[0] + 8}-${
      workingTimeParts[0] + 8 + overWorkTime || ''
    }`
  } else if (isOverWork) {
    calculatedWorkingTime = `${workingTimeParts[0]}-${
      workingTimeParts[0] + 9 || ''
    }`
    calculatedOverWorkTime = `${workingTimeParts[0] + 9}-${
      workingTimeParts[0] + 9 + overWorkTime || ''
    }`
  } else {
    calculatedWorkingTime = `${workingTimeParts[0]}-${
      workingTimeParts[1] || ''
    }`
  }

  let overWorkSalary = isOverWork
    ? (ranksSalary[rank].overWork || 0) * overWorkTime
    : 0
  console.log(gamesCount, ranksSalary[rank].overWork * (gamesCount - 2))
  if (rank === 'актёр' && gamesCount && gamesCount > 2) {
    overWorkSalary = (ranksSalary[rank].overWork || 0) * (gamesCount - 2)
  }

  let bonuses = 0

  try {
    bonuses = evaluate(data.bonuses)
  } catch (e) {}

  return {
    calculatedWorkingTime,
    calculatedOverWorkTime,
    overWorkSalary,
    salary,
    bonuses,
  }
}
