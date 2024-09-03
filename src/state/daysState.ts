import {atom} from 'recoil'
import {Day} from '../utils/types'

export default atom<Day[]>({
  key: 'days',
  default: new Array<Day>(14).fill({
    date: '',
  }),
})
