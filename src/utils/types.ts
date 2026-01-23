import {DateTime} from 'luxon'
import {Client} from 'pg'

export type Day = {
  date?: DateTime
  value?: string
  comment?: string
  location?: string
  invalidComment?: boolean
  locationData?: LocationData[]
}

export type LocationData = {
  self: boolean
  locationName: string
  data?: {
    time: string
    role: string
    worker: string
    rank: string
  }
}

export type SelectedDay = {
  date?: DateTime
  invalidComment?: boolean
}

export interface Permission {
  name: string
  description: string
  id: number
}

export interface LTWorker {
  id: number
  name: string
  number?: number | null
  telegramId: number
  balance: number | null
  isFormer?: boolean | null
  location?: LTLocation['name'] | null
  locationId?: LTLocation['id'] | null
  rank: LTRank['name']
  firstName?: string | null
  middleName?: string | null
  lastName?: string | null
  phoneNumber?: string | null
  email?: string | null
  photoUrl?: string | null
  permissions: Permission[]
  todayLocation?: LTLocation['id'] | null
}

export interface LTWorkType {
  id: number
  name: string
}

export interface WorkerSalary {
  worker: string
  location: string
  workingHours: string
  createdAt: string | null
  bonuses: string
  fines: string
  comment: string
  hasGames?: boolean
  isHardTime: boolean
  gamesCount: number
  value?: number
  overwork?: number
  deleted?: number
  type?: string
  withoutDate?: boolean
  sorting_weight: number
  oneGames: {id: LTGamePayment['id']; value: number; number: number} | null
  twoGames: {id: LTGamePayment['id']; value: number; number: number} | null
  threeGames: {id: LTGamePayment['id']; value: number; number: number} | null
  actorGames: {id: LTGamePayment['id']; value: number; number: number} | null
  workTypes: LTWorkType['id'][]
}
//
// export interface SalaryData {
//   date: string
//   start_time: string
//   end_time: string
//   overwork_start: string | null
//   overwork_end: string | null
//   overwork: number | null
//   value: number
//   bonuses: string | null
//   fines: string
//   comment: string | null
//   created_at: string
//   worker_name: string
//   worker_id: number
//   created_by: string
//   updated_by?: number
//   location: LTLocation
//   type?: string
//   oneGames: {id: LTGamePayment['id']; value: number; number: number} | null
//   twoGames: {id: LTGamePayment['id']; value: number; number: number} | null
//   threeGames: {id: LTGamePayment['id']; value: number; number: number} | null
//   actorGames: {id: LTGamePayment['id']; value: number; number: number} | null
//   workTypes: LTWorkType['id'][]
//   faceId: LTFaceIdData[]
// }

export interface SalaryData {
  id: number
  date: string
  startTime: string
  endTime: string
  overworkStart: string | null
  overworkEnd: string | null
  overworkValue: number | null
  value: number
  bonuses: string | null
  fines: string
  comment: string | null
  createdAt: string
  createdBy: string
  updatedBy?: number
  location: LTLocation
  type?: string
  oneGames: {id: LTGamePayment['id']; value: number; number: number} | null
  twoGames: {id: LTGamePayment['id']; value: number; number: number} | null
  threeGames: {id: LTGamePayment['id']; value: number; number: number} | null
  actorGames: {id: LTGamePayment['id']; value: number; number: number} | null
  workTypes: LTWorkType['id'][]
  faceId: {
    timestamp: string
    location: LTLocation
  }[]
}

export interface SalaryUser {
  id: number
  name: string
  rank: string | null
  firstName: string | null
  isFormer: boolean | null
}

export interface UserSalary {
  worker: {
    id: LTWorker['id']
    name: LTWorker['name']
    rank: LTRank['name']
    firstName: LTWorker['firstName'] | null
    isFormer: LTWorker['isFormer']
  }
  dates: SalaryData[]
}

export interface LTLocation {
  name: string
  shortName: string
  color: string
  id: number
}

export interface LTRank {
  name: string
  salary: number
  overwork: number
  maxPoints: number
  maxShiftPoints: number
  weight: number
}

export interface LTPoint {
  id: number
  name: string
  description: string
  value: number
}

export interface LTPointData {
  id: number
  value: number
  date: string
  createdBy: string
  createdAt: string
  isAboveLimit: boolean
  comment: string | null
}

export interface WorkerPoint {
  worker: LTWorker
  points: {
    pointInfo: LTPoint
    isRequired: boolean
    maxValue: number
    data: LTPointData[]
  }[]
}

export interface Filter {
  key: string
  value: string | number
}

export interface SocketUpdateProps {
  data: any
  client: Client
}

export interface LTPayroll {
  id: number
  dates: string
  takeBy: string
  createdAt: string
  createdBy: LTWorker
  bonuses: boolean | null
  workersCount: string
}

export interface LTWorkerPayrollData {
  worker: {
    name: LTWorker['name']
    id: LTWorker['id']
    rank: LTWorker['rank']
  }
  value: number
  bonuses: number | null
  external_payment: number | null
  location_id: LTLocation['id']
  to_take_by: {
    name: LTWorker['name'] | null
    rank: LTWorker['rank'] | null
  }
  to_take: number | null
  issue_confirmed: boolean | null
  taken_by: {
    name: LTWorker['name'] | null
    rank: LTWorker['rank'] | null
  }
  taken: number | null
  taken_at: string | null
}

export interface LTPayrollData {
  workerId: LTWorker['id']
  location: LTLocation['id']
  external_payment: number | null
  bonuses?: number
  fines?: number
  value: number
}

export interface LTPayrollCreateData {
  workersData: LTPayrollData[]
  dates: {start: string; end: string}
  withBonuses: boolean
  takeBy: string
  moneyOnLocations: {
    location: LTLocation['id']
    value: number
  }[]
}

export interface LTMoneyOnLocationsData {
  location: LTLocation['name']
  location_id: LTLocation['id']
  value: number
}

export interface LTPayrollIssueData {
  take_by: LTPayroll['takeBy']
  taken: number | null
  dates: LTPayroll['dates']
  to_take_by: LTWorkerPayrollData['to_take_by']
  balance: LTWorker['balance']
  location: LTLocation['name']
  value: number
  issue_confirmed: boolean | null
  external_payment: number | null
  id: LTPayroll['id']
}

export interface LTTakeByPayrollData {
  to_take: number
  name: LTWorker['name']
  id: LTWorker['id']
  payroll_id: LTPayroll['id']
  location_id: LTLocation['id']
}

export interface LTGamePayment {
  id: number
  name: string
  description: string
  value: number
  key: string
  rank: number
}

export interface LTFaceIdData {
  workerId: LTWorker['id']
  data: {
    location: LTLocation
    date: string
  }[]
}

export interface LTPaymentType {
  id: number
  name: string
  value: number
  percent: number
  ranks: LTRank[]
}

export interface LTPayment {
  id: number
  worker?: LTWorker
  date: string
  value?: number
  type?: LTPaymentType['name']
  editMode?: boolean
  create?: boolean
  delete?: boolean
  comment?: string | null
}

export interface LTPaymentChangeData {
  id: number
  date: string
  value: number | null
  worker: LTWorker['name']
  type: LTPaymentType['id'] | null
  comment: string | null
  create: boolean
  delete: boolean
}

export interface WrapperWorkers {
  worker: LTWorker['name']
  rank: LTRank['name']
  count: number
}

export interface WrappedLocations {
  location: LTLocation['name']
  count: number
}

export interface WrappedShifts {
  count: number
}

export interface WrappedSchedule {
  plus: number
  minus: number
  limitations: number
  count: number
  [key: string]: number
}

export interface WrappedDeals {
  count: number
  actor: number
  worker: number
}

export interface WrappedDealsType {
  name: string
  count: number
}

export interface LTWorkerData {
  id: number
  name: string
  firstName: string | null
  lastName: string | null
  middleName: string | null
  telegramId: number
  email: string | null
  isFormer: boolean
  isFired: boolean
  photoUrl: string | null
  phoneNumber: string | null
  role: string | null
  location: LTLocation
  rank: {
    id: number
    name: string
    weight: number
    sortingWeight: number
  }
  rankData: RankRequirement[]
}

export interface RankRequirement {
  id: number
  name: string
  description: string
  limit: number | null
  type: 'check' | 'number'
  category: string | null
  done: boolean
  value: number | null
}

export interface RankDescription {
  rank: {
    id: number
    name: string
    weight: number
    sortingWeight: number
  }
  data: RankRequirement[]
}
