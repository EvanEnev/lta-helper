export interface CellBGColorStyle {
  rgbColor: {
    red: number
    green: number
    blue: number
  }
}

export interface Comment {
  date: string
  value: string
}

export interface Change {
  date: string
  newValue: string
  comment?: string
  location?: string
}

export interface CellValue {
  value: string
  effectiveValue?: string
}

export interface LocationChange {
  date: string
  weekday: string
  location: string
  value?: string
  comment?: string
}