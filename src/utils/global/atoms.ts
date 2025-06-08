import {atom} from 'jotai'
import {Day, SelectedDay} from '@/src/utils/types'
import {DateTime} from 'luxon'

export const daysAtom = atom<Day[]>(
  new Array<Day>(14).fill({
    date: undefined,
  }),
)

export const selectedDatesAtom = atom<DateTime[]>([])

export const selectedDayAtom = atom<SelectedDay>({date: undefined})

export const telegramAtom = atom<any>({})
