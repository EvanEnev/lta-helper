'use client'

import {UserSalary} from '@/src/utils/types'
import {Tab, Tabs} from '@heroui/react'
import Table from '@/src/components/salary/Table'
import Summarized from '@/src/components/salary/Summarized'

export default function Salary({
  data,
  canViewFull,
  canEdit,
}: {
  data: UserSalary[]
  canViewFull: boolean
  canEdit: boolean
}) {
  if (!canViewFull) {
    return <Table data={data} canEdit={canEdit} canViewFull={canViewFull} />
  }

  return (
    <Tabs color="primary" size="lg" className="ml-4">
      <Tab title="График" className="data-[slot=panel]:p-0">
        <Table data={data} canEdit={canEdit} canViewFull={canViewFull} />
      </Tab>
      <Tab title="Сводная">
        <Summarized />
      </Tab>
    </Tabs>
  )
}
