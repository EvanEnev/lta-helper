export type Day = {
  date: Date
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
