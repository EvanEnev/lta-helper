export type Day = {
  date: string
  value?: string
  comment?: string
  location?: string
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

export type Worker = {
  name: string
  valid: boolean
  workingDays: WorkingDay[]
}
