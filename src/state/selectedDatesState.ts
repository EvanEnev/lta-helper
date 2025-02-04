import {atom} from 'recoil'

export default atom<Date[]>({
  key: 'selectedDates',
  default: [],
})
