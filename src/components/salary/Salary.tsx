'use client'

import {LTLocation, LTRank, UserSalary} from '@/src/utils/types'
import {Button, Tab, Tabs} from '@heroui/react'
import Table from '@/src/components/salary/Table'
import Summarized from '@/src/components/salary/Summarized'
import {useEffect, useMemo, useState} from 'react'
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
  const {setExiting, setCustomHeaderComponents} = useAuth()
  const [selectedTab, setSelectedTab] = useState<any>('table')

  const switchComponent = useMemo(
    () => (
      <div key="tabSwitch" className="glass flex gap-2 p-2">
        <Button
          onPress={() => setSelectedTab('table')}
          color={selectedTab === 'table' ? 'primary' : 'default'}
          variant={selectedTab === 'table' ? 'solid' : 'ghost'}>
          График
        </Button>
        <Button
          onPress={() => setSelectedTab('summary')}
          color={selectedTab === 'summary' ? 'primary' : 'default'}
          variant={selectedTab === 'summary' ? 'solid' : 'ghost'}>
          Сводная
        </Button>
      </div>
    ),
    [selectedTab],
  )

  useEffect(() => {
    setExiting(false)
    if (canViewFull) {
      setCustomHeaderComponents([switchComponent])
    }
  }, [setExiting, setCustomHeaderComponents, switchComponent, canViewFull])

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
    <Tabs
      color="primary"
      size="lg"
      className="sticky left-0 ml-4"
      selectedKey={selectedTab}
      onSelectionChange={setSelectedTab}
      classNames={{base: 'hidden'}}>
      <Tab key="table" title="График" className="data-[slot=panel]:p-0">
        <Table
          dates={dates}
          data={data}
          canEdit={canEdit}
          canViewFull={canViewFull}
        />
      </Tab>
      <Tab key="summary" title="Сводная">
        <Summarized ranks={ranks} locations={locations} />
      </Tab>
    </Tabs>
  )
}
