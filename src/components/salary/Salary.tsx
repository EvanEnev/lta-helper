'use client'

import {LTLocation, LTRank, UserSalary} from '@/src/utils/types'
import {Button, Tab, Tabs} from '@heroui/react'
import Table from '@/src/components/salary/Table'
import {useEffect, useMemo, useState} from 'react'
import {useAuth} from '@/src/components/global/providers/authProvider'
import SummarizedPage from '@/src/components/salary/summarized/SummarizedPage'

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
  const {setExiting, setPageSettings} = useAuth()
  const [selectedTab, setSelectedTab] = useState<any>('table')

  const switchComponent = useMemo(
    () => (
      <div key="tabSwitch" className="flex gap-2">
        <Button
          className="flex-1"
          onPress={() => setSelectedTab('table')}
          color={selectedTab === 'table' ? 'primary' : 'default'}>
          График
        </Button>
        <Button
          className="flex-1"
          onPress={() => setSelectedTab('summary')}
          color={selectedTab === 'summary' ? 'primary' : 'default'}>
          Сводная
        </Button>
      </div>
    ),
    [selectedTab],
  )

  useEffect(() => {
    setExiting(false)
    if (canViewFull) {
      setPageSettings([{label: 'Страница', components: [switchComponent]}])
    }
  }, [setExiting, setPageSettings, switchComponent, canViewFull])

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
    <Table
      dates={dates}
      data={data}
      canEdit={canEdit}
      canViewFull={canViewFull}
    />
    // <Tabs
    //   color="primary"
    //   size="lg"
    //   className="sticky left-0 ml-4"
    //   selectedKey={selectedTab}
    //   onSelectionChange={setSelectedTab}
    //   classNames={{base: 'hidden'}}>
    //   <Tab key="table" title="График" className="data-[slot=panel]:p-0">
    //     <Table
    //       dates={dates}
    //       data={data}
    //       canEdit={canEdit}
    //       canViewFull={canViewFull}
    //     />
    //   </Tab>
    //   <Tab key="summary" title="Сводная">
    //     <SummarizedPage ranks={ranks} locations={locations} />
    //   </Tab>
    // </Tabs>
  )
}
