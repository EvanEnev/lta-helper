'use client'

import {
    LTFaceIdData,
    LTGamePayment,
    LTLocation, LTWorker,
    UserSalary,
} from '@/src/utils/types'
import Table from '@/src/components/salary/Table'

export default function Salary({
    worker,
  data,
  canViewFull,
  canEdit,
  dates,
  gamesPayments,
  faceIdData,
  locations,
}: {
    worker: LTWorker
  data: UserSalary[]
  canViewFull: boolean
  canEdit: boolean
  dates: string[]
  gamesPayments: LTGamePayment[]
  faceIdData: LTFaceIdData[]
  locations: LTLocation[]
}) {
  return (
    <Table
        worker={worker}
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
