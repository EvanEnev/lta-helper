import {atom} from 'recoil'
import {SelectedDay} from '../utils/types'

export default atom<SelectedDay>({
  key: 'selectedDay',
  default: {
    date: '',
  },
})
