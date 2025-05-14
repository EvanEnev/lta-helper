import {AlertVariantProps} from '@heroui/react'
import {atom} from 'jotai'
import {Day, SelectedDay} from '@/src/utils/types'

type AlertData = {
  color: AlertVariantProps['color']
  message: string
  title: string
}

export const alertAtom = atom<AlertData>({
  color: 'default',
  message: '',
  title: '',
})

export const daysAtom = atom<Day[]>(
  new Array<Day>(14).fill({
    date: undefined,
  }),
)

export const selectedDatesAtom = atom<Date[]>([])

export const selectedDayAtom = atom<SelectedDay>({date: undefined})

export const telegramAtom = atom<any>({})

export const workerAtom = atom<any>({})
