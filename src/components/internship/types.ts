export type InternshipResult = 'passed' | 'failed'

export interface InternshipRow {
  workerId: number
  workerName: string
  internshipId: number | null
  curator: string | null
  curatorId: number | null
  plannedDays: number | null
  daysCount: number
  startedAt: string | null
  closedAt: string | null
  result: InternshipResult | null
}

export interface InternshipDay {
  id: number
  date: string
  strengths: string
  weaknesses: string
  toLearn: string
  createdBy: string
}

export interface InternshipDetails {
  id: number
  workerId: number
  workerName: string
  curator: string
  curatorId: number
  plannedDays: number
  startedAt: string
  closedAt: string | null
  result: InternshipResult | null
  summary: string | null
  days: InternshipDay[]
}
