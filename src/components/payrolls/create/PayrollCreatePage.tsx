'use client'

import {LTLocation, LTRank, LTWorker} from '@/src/utils/types'
import {Fragment, useMemo, useState} from 'react'
import Location from '@/src/components/global/Location'
import {Button, Code, Divider, Link} from '@heroui/react'
import PayrollCreateValueCell from '@/src/components/payrolls/create/PayrollCreateValueCell'
import PayrollCreateWorkerCell from '@/src/components/payrolls/create/PayrollCreateWorkerCell'
import Table from '@/src/components/global/table/Table'
import PayrollCreateLocationCell from '@/src/components/payrolls/create/PayrollCreateLocationCell'
import {ArrowLeft, Plain} from 'solar-icon-set'

interface PayrollCreatePageProps {
  data: {
    name: LTWorker['name']
    id: LTWorker['id']
    rank: LTRank['name']
    value: number | null
    bonuses?: number
    fines?: number
  }[]
  moneyOnLocations: {
    location: LTLocation['id']
    value: number
  }[]
  locations: LTLocation[]
}

const locationsToHide = ['выезд', 'другое', 'отдел продаж']

export default function PayrollCreatePage({
  data: initialData,
  moneyOnLocations,
  locations,
}: PayrollCreatePageProps) {
  const [newMoneyOnLocations, setNewMoneyOnLocations] = useState<
    {
      location: LTLocation['id']
      value: number
    }[]
  >(moneyOnLocations)

  const [data, setData] = useState<
    {
      name: LTWorker['name']
      rank: LTRank['name']
      value: number | null
      bonuses?: number
      fines?: number
      location: LTLocation['id'] | null
    }[]
  >(initialData.map(d => ({...d, location: null})))

  const [payrollData, setPayrollData] = useState<
    {
      workerId: LTWorker['id']
      location: LTLocation['id']
      value: number
    }[]
  >([])

  const columns = useMemo(() => {
    return [
      {
        header: 'Сотрудник',
        accessorFn: (row: PayrollCreatePageProps['data'][0]) => {
          return {name: row.name, rank: row.rank, workerId: row.id}
        },
        cell: ({
          getValue,
        }: {
          getValue: () => {name: string; rank: string; id: number}
        }) => <PayrollCreateWorkerCell data={getValue()} />,
      },
      {
        header: 'Сумма',
        accessorKey: 'value',
        accessorFn: (row: PayrollCreatePageProps['data'][0]) => {
          return {value: row.value, workerId: row.id}
        },
        cell: ({
          getValue,
        }: {
          getValue: () => {value: number; workerId: number}
        }) => (
          <PayrollCreateValueCell
            data={getValue().value || 0}
            callback={value => {
              setPayrollData(prev =>
                prev.map(d =>
                  d.workerId === getValue().workerId ? {...d, value} : d,
                ),
              )
            }}
          />
        ),
      },
      {
        header: 'Локация',
        accessorFn: (row: PayrollCreatePageProps['data'][0]) => {
          return {workerId: row.id}
        },
        cell: ({getValue}: {getValue: () => {workerId: number}}) => (
          <PayrollCreateLocationCell
            locations={locations}
            callback={(location: LTLocation) => {
              setPayrollData(prev =>
                prev.map(d =>
                  d.workerId === getValue().workerId
                    ? {...d, location: location.id}
                    : d,
                ),
              )
            }}
          />
        ),
      },
    ]
  }, [])

  return (
    <main className="p-4">
      <Button
        as={Link}
        href="/payrolls"
        className="mb-4"
        startContent={<ArrowLeft />}>
        Назад
      </Button>
      <div className="flex gap-4">
        <div className="w-[90%]">
          <Table data={data} columns={columns} />
        </div>
        <div className="glass sticky top-0 grid h-fit auto-rows-auto grid-cols-3 gap-2 rounded-2xl p-2">
          <p className="text-center">Локация</p>
          <Code color="primary" className="text-center">
            Начало
          </Code>
          <Code color="success" className="text-center">
            Остаток
          </Code>
          {locations
            .filter(l => !locationsToHide.includes(l.name.toLowerCase()))
            .map(location => {
              return (
                <Fragment key={location.id}>
                  <Divider className="col-span-full" />
                  <Location locationName={location.name} />
                  <Code color="primary">
                    {
                      moneyOnLocations.find(d => d.location === location.id)!
                        .value
                    }
                  </Code>
                  <Code color="success">
                    {newMoneyOnLocations.find(d => d.location === location.id)
                      ?.value || 0}
                  </Code>
                </Fragment>
              )
            })}
          <Button
            startContent={<Plain size={24} />}
            className="cols-span-full w-full"
            variant="shadow"
            color="primary">
            Отправить
          </Button>
        </div>
      </div>
    </main>
  )
}
