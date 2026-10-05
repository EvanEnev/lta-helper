import {atom} from 'jotai'

export const toastOffsetAtom = atom<number>(0)

export const headerSizesAtom = atom<{
  height: number | null
  width: number | null
}>({height: null, width: null})
