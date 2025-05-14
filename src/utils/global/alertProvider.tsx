'use client'

import {Alert} from '@heroui/react'
import {useAtom} from 'jotai'
import {alertAtom} from '@/src/utils/global/atoms'

export default function AlertProvider() {
  const [alertData, setAlertData] = useAtom(alertAtom)

  return (
    <div
      className={`fixed z-40 w-full p-2 ${alertData.message ? '' : 'hidden'}`}>
      <Alert
        color={alertData?.color}
        isVisible={!!alertData?.message}
        description={alertData?.message}
        title={alertData?.title}
        onClose={() => setAlertData({title: '', message: '', color: 'default'})}
        variant="solid"
      />
    </div>
  )
}
