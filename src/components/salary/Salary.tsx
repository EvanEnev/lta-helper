'use client'

import {UserSalary} from '@/src/utils/types'
import Table from '@/src/components/salary/Table'
import {useEffect} from 'react'
import {useAuth} from '@/src/components/global/providers/authProvider'

export default function Salary({
  data,
  canViewFull,
  canEdit,
  dates,
}: {
  data: UserSalary[]
  canViewFull: boolean
  canEdit: boolean
  dates: string[]
}) {
  const {setExiting} = useAuth()

  useEffect(() => {
    console.debug(data)
    setExiting(false)
  }, [setExiting])

  return (
    <Table
      dates={dates}
      data={data}
      canEdit={canEdit}
      canViewFull={canViewFull}
    />
  )
}
