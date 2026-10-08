import {DateTime} from 'luxon'

export interface CellBGColorStyle {
  rgbColor: {
    red: number
    green: number
    blue: number
  }
}

export interface Change {
  date: DateTime
  newValue: string
  comment?: string
  location?: string
}

export interface CellValue {
  value: string
  effectiveValue?: string
}
