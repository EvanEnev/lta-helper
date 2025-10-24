import {LTGamePayment, LTRank, LTWorker} from '@/src/utils/types'

interface LTSalary {
  value: number
  bonuses: string
  fines: string
  comment?: string
  created_by: number
  start_time: string
  end_time: string
  overwork_start?: string
  overwork_end?: string
  overwork?: number
  oneGames: number
  twoGames: number
  threeGames: number
  actorGames: number
}

interface SalaryDataProps {
  gamesPayments: LTGamePayment[]
  rank?: LTRank
  workingHours: string
  isHardTime: boolean
  comment: string
  bonuses: string
  fines: string
  worker: LTWorker
  oneGames: {id: number; number: number} | null
  twoGames: {id: number; number: number} | null
  threeGames: {id: number; number: number} | null
  actorGames: {id: number; number: number} | null
  override?: Partial<LTSalary>
}

export default function getSalaryData({
  rank,
  workingHours,
  isHardTime,
  comment,
  bonuses,
  fines,
  worker,
  oneGames,
  twoGames,
  threeGames,
  actorGames,
  gamesPayments,
  override,
}: SalaryDataProps): LTSalary | null {
  let workingTimeParts: string[] | number[] = workingHours.split('-')

  if (workingTimeParts.length < 2) return null

  workingTimeParts = workingTimeParts.map(v => parseInt(v))

  if (workingTimeParts[1] < 12) {
    workingTimeParts[1] += 24
  }

  const workingTime = workingTimeParts[1] - workingTimeParts[0]

  const overWorkTime = workingTime - (isHardTime ? 8 : 9)
  const isOverWork = overWorkTime > 0 && rank?.name !== 'Актёр'

  let calculatedWorkingTime = ''
  let calculatedOverWorkTime = ''

  if (isHardTime && isOverWork) {
    calculatedWorkingTime = `${workingTimeParts[0]}-${workingTimeParts[0] + 8}`
    calculatedOverWorkTime = `${workingTimeParts[0] + 8}-${
      workingTimeParts[0] + 8 + overWorkTime
    }`
  } else if (isOverWork) {
    calculatedWorkingTime = `${workingTimeParts[0]}-${workingTimeParts[0] + 9}`
    calculatedOverWorkTime = `${workingTimeParts[0] + 9}-${
      workingTimeParts[0] + 9 + overWorkTime
    }`
  } else {
    calculatedWorkingTime = `${workingTimeParts[0]}-${workingTimeParts[1]}`
  }

  let salary = rank?.salary || 0
  let overworkSalary = 0
  let oneGamesSalary =
    rank?.name === 'Железный'
      ? 0
      : (oneGames?.number || 0) *
        (gamesPayments.find(p => p.id === oneGames?.id)?.value || 0)

  let twoGamesSalary =
    rank?.name === 'Железный'
      ? 0
      : (twoGames?.number || 0) *
        (gamesPayments.find(p => p.id === twoGames?.id)?.value || 0)

  let threeGamesSalary =
    rank?.name === 'Железный'
      ? 0
      : (threeGames?.number || 0) *
        (gamesPayments.find(p => p.id === threeGames?.id)?.value || 0)

  let actorGamesSalary =
    rank?.name === 'Железный'
      ? 0
      : (actorGames?.number || 0) *
        (gamesPayments.find(p => p.id === actorGames?.id)?.value || 0)

  if (rank?.name === 'Актёр') {
    if ((actorGames?.number || 0) < 3) {
      actorGamesSalary = 0
    } else {
      actorGamesSalary =
        actorGamesSalary -
        (gamesPayments.find(p => p.id === actorGames?.id)?.value || 0) * 2
    }
  }

  if (comment?.toLowerCase().includes('под игру')) {
    salary = 1000
  }

  // if (rank?.name === 'Актёр' && gamesCount && gamesCount > 2) {
  //   overworkSalary += (rank?.overwork || 0) * (gamesCount - 2)
  // }

  if (isOverWork) {
    overworkSalary += (rank?.overwork || 0) * overWorkTime
  }

  let workingStart = calculatedWorkingTime.split('-')[0]
  let workingEnd = calculatedWorkingTime.split('-')[1]

  if (parseInt(workingStart) > 24) {
    workingStart = `${parseInt(workingStart) - 24}`
  }

  if (parseInt(workingEnd) > 24) {
    workingEnd = `${parseInt(workingEnd) - 24}`
  }

  let overworkStart = calculatedOverWorkTime.split('-')[0]
  let overworkEnd = calculatedOverWorkTime.split('-')[1]

  if (parseInt(overworkEnd) > 24) {
    overworkEnd = `${parseInt(overworkEnd) - 24}`
  }

  if (parseInt(overworkStart) > 24) {
    overworkStart = `${parseInt(overworkStart) - 24}`
  }

  if (workingStart) workingStart += ':00'
  if (workingEnd) workingEnd += ':00'

  if (overworkStart) overworkStart += ':00'
  if (overworkEnd) overworkEnd += ':00'

  bonuses = bonuses?.replace(/[+\-*/%^]+$/, '').replaceAll('-', '+')
  fines = fines?.replace(/[+\-*/%^]+$/, '').replaceAll('+', '-')
  comment = comment?.trim()

  if (!fines?.startsWith('-') && fines !== '0') {
    fines = '-' + (fines || '0')
  }

  const data = {
    value: salary,
    start_time: workingStart,
    end_time: workingEnd,
    overwork: overworkSalary,
    overwork_start: overworkStart,
    overwork_end: overworkEnd,
    bonuses: bonuses || '0',
    fines: fines || '0',
    comment,
    created_by: worker.id,
    oneGames: oneGamesSalary,
    twoGames: twoGamesSalary,
    threeGames: threeGamesSalary,
    actorGames: actorGamesSalary,
  }

  Object.keys(override || {}).forEach(key => {
    // @ts-ignore
    if (override[key] === undefined) return
    // @ts-ignore
    data[key] = override[key]
  })

  return data
}
