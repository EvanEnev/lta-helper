'use client'

import alertState from '@/src/state/alertState'
import {Alert} from '@nextui-org/react'
import {useRecoilState} from 'recoil'

export default function AlertProvider() {
  const [alertData, setAlertData] = useRecoilState(alertState)

  return (
    <Alert
      color={alertData?.color}
      isVisible={!!alertData?.message}
      description={alertData?.message}
      title={alertData?.title}
      onClose={() => setAlertData({title: '', message: '', color: 'default'})}
      variant="solid"
      classNames={{
        base: 'sticky z-40 top-4 w-[90%]',
      }}
    />
  )
}
