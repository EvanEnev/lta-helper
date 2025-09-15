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

export interface WorkerSalary {
  worker: string
  location: string
  workingHours: string
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
}

export interface SalaryData {
  date: string
  start_time: string
  end_time: string
  overwork_start: string | null
  overwork_end: string | null
  overwork: number | null
  value: number
  bonuses: string | null
  fines: string
  comment: string | null
  created_at: string
  worker_name: string
  worker_id: number
  created_by: string
  updated_by?: number
  location: LTLocation
  type?: string
}

export interface SalaryUser {
  id: number
  name: string
  rank: string | null
  firstName: string | null
  isFormer: boolean | null
}

export interface UserSalary {
  user: SalaryUser
  dates: (SalaryData | null)[]
  [key: string]: string | SalaryData | SalaryUser | (SalaryData | null)[]
}

export interface LTLocation {
  name: string
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
  location_id: LTLocation['id']
  to_take_by: LTWorker['name'] | null
  to_take: number | null
  issue_confirmed: boolean | null
  taken_by: LTWorker['name'] | null
  taken: number | null
  taken_at: string | null
}

export interface LTPayrollData {
  workerId: LTWorker['id']
  location: LTLocation['id']
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
  value: number
}

export interface LTPayrollIssueData {
  take_by: LTPayroll['takeBy']
  dates: LTPayroll['dates']
  to_take_by: LTWorkerPayrollData['to_take_by']
  balance: LTWorker['balance']
  location: LTLocation['name']
  value: number
  id: LTPayroll['id']
}

export interface LTTakeByPayrollData {
  to_take: number
  name: LTWorker['name']
  id: LTWorker['id']
  payroll_id: LTPayroll['id']
  location_id: LTLocation['id']
}
