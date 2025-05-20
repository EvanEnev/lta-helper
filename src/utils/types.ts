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
  date: Date,
  start_time: string,
  end_time: string,
  value: number,
  bonuses: string | null,
  fines: string,
  comment: string | null,
  created_at: Date,
  worker_name: string,
  created_by: string,
  location: {
    name: string,
    color: string,
  }
}

export interface SalaryUser {
  name: string,
  rank: string | null,
  firstName: string | null
}

export interface UserSalary {
  user: SalaryUser
  [key: string]: string | SalaryData | SalaryUser
}
