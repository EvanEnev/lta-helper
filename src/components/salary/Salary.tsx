'use client'

import {LTLocation, LTRank, UserSalary} from '@/src/utils/types'
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
  locations,
}: {
  data: UserSalary[]
  canViewFull: boolean
  canEdit: boolean
  dates: string[]
  ranks: LTRank[]
  locations: LTLocation[]
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
    <Tabs color="primary" size="lg" className="sticky left-0 ml-4">
      <Tab title="График" className="data-[slot=panel]:p-0">
        <Table
          dates={dates}
          data={data}
          canEdit={canEdit}
          canViewFull={canViewFull}
        />
      </Tab>
      <Tab title="Сводная">
        <Summarized ranks={ranks} locations={locations} />
      </Tab>
    </Tabs>
  )
}
