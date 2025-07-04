'use client'

import {LTRank, UserSalary} from '@/src/utils/types'
import {Tab, Tabs} from '@heroui/react'
import Table from '@/src/components/salary/Table'
import Summarized from '@/src/components/salary/Summarized'
import {useEffect} from 'react'
import {useAuth} from '@/src/components/global/providers/authProvider'

export default function Salary({
  data,
  canViewFull,
  canEdit,
  dates,
  ranks,
}: {
  data: UserSalary[]
  canViewFull: boolean
  canEdit: boolean
  dates: string[]
  ranks: LTRank[]
}) {
  const {setExiting} = useAuth()

  useEffect(() => {
    setExiting(false)
  }, [setExiting])

  if (!canViewFull) {
    return (
      <Table
        dates={dates}
        data={data}
        canEdit={canEdit}
        canViewFull={canViewFull}
      />
    )
  }

  return (
    <Tabs color="primary" size="lg" className="ml-4">
      <Tab title="График" className="data-[slot=panel]:p-0">
        <Table
          dates={dates}
          data={data}
          canEdit={canEdit}
          canViewFull={canViewFull}
        />
      </Tab>
      <Tab title="Сводная">
        <Summarized ranks={ranks} />
      </Tab>
    </Tabs>
  )
}
