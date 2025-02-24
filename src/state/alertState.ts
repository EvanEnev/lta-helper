import {atom} from 'recoil'
import {Day} from '../utils/types'
import {AlertVariantProps} from "@heroui/react"

type AlertData = {
  color: AlertVariantProps['color']
  message: string
  title: string
}

export default atom<AlertData>({
  key: 'alert',
  default: {
    color: 'default',
    message: '',
    title: '',
  },
})
