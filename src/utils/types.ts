import {DateTime} from "luxon";

export type Day = {
  date?: Date
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
  date?: Date
  invalidComment?: boolean
}

export interface Worker {
  name: string
  id: number
  telegramId: number
  isFormer?: boolean
  location?: string
  rank: string
  firstName?: string
  middleName?: string
  lastName?: string
  phoneNumber?: string
  email?: string
}

export interface WorkerSalary {
  worker: string
  location: string
  workingHours: string
  bonuses: string
  comment: string
  hasGames?: boolean
  isHardTime: boolean
  gamesCount: number
}

export interface SalaryData {
  date: string,
  start_time: string,
  end_time: string,
  overwork_start: string | null,
  overwork_end: string | null,
  overwork: number | null,
  value: number,
  bonuses: string | null,
  fines: string,
  comment: string | null,
  created_at: string,
  worker_name: string,
  worker_id: number,
  created_by: string,
  updated_by?: number,
  location: {
    name: string,
    color: string,
  }
}

export interface SalaryUser {
  id: number
  name: string,
  rank: string | null,
  firstName: string | null
}

export interface UserSalary {
  user: SalaryUser
  [key: string]: string | SalaryData | SalaryUser
}
