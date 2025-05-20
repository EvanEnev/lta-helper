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

export type WorkingDay = {
  date: string
  value: string
  location?: string
}

export interface Comment {
  date: string
  value: string
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
}
