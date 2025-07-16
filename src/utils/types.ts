import {DateTime} from 'luxon'

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
  name: string
  id: number
  number?: number
  telegramId: number
  isFormer?: boolean
  location?: string
  locationId?: number
  rank: string
  firstName?: string
  middleName?: string
  lastName?: string
  phoneNumber?: string
  email?: string
  photoUrl?: string
  permissions: Permission[]
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

export interface WorkerTimetable {
  worker: Omit<LTWorker, 'permissions'>
  data: TimetableData[]
}

export interface TimetableData {
  date: string
  startTime: string
  endTime: string
  comment: string | null
  location: LTLocation
}
