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

export type User = {
  initData?: string
  initDataUnsafe?: any
  query_id: string
  user: {
    id: number
    first_name: string
    last_name: string
    username: string
    language_code: string
    allows_write_to_pm: boolean
  }
  auth_date: string
  hash: string
}

export type WorkingDay = {
  date: string
  value: string
  location?: string
}

export interface Comment {
  date: string
  value: string
}

export type Worker = {
  name: string
  workingDays: WorkingDay[]
  type: string
  comments: Comment[]
  isAdmin: boolean
  location?: string
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
