import {atom} from 'recoil'

export default atom<string>({
  key: 'globalComment',
  default: '',
})
