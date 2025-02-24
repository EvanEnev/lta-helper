'use client'

import alertState from '@/src/state/alertState'
import {Alert} from '@nextui-org/react'
import {useRecoilState} from 'recoil'

export default function AlertProvider() {
  const [alertData, setAlertData] = useRecoilState(alertState)

  return (
    <div className="fixed z-40 w-full p-2">
      <Alert
        color={alertData?.color}
        isVisible={!!alertData?.message}
        description={alertData?.message}
        title={alertData?.title}
        onClose={() => setAlertData({title: '', message: '', color: 'default'})}
        variant="solid"
        classNames={{
          base: 'w-full',
        }}
      />
    </div>
  )
}
