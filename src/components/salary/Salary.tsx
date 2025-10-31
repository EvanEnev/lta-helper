'use client'

import {
  LTFaceIdData,
  LTGamePayment,
  LTLocation,
  UserSalary,
} from '@/src/utils/types'
import Table from '@/src/components/salary/Table'
import {useEffect} from 'react'
import {useAuth} from '@/src/components/global/providers/authProvider'

export default function Salary({
  data,
  canViewFull,
  canEdit,
  dates,
  gamesPayments,
  faceIdData,
  locations,
}: {
  data: UserSalary[]
  canViewFull: boolean
  canEdit: boolean
  dates: string[]
  gamesPayments: LTGamePayment[]
  faceIdData: LTFaceIdData[]
  locations: LTLocation[]
}) {
  const {setExiting} = useAuth()

  useEffect(() => {
    setExiting(false)
  }, [setExiting])

  return (
    <Table
      locations={locations}
      faceIdData={faceIdData}
      dates={dates}
      data={data}
      canEdit={canEdit}
      canViewFull={canViewFull}
      gamesPayments={gamesPayments}
    />
  )
}
