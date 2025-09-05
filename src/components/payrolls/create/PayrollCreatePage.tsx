'use client'

import {
  LTLocation,
  LTPayrollCreateData,
  LTPayrollData,
  LTRank,
  LTWorker,
} from '@/src/utils/types'
import {Fragment, useCallback, useMemo, useState} from 'react'
import Location from '@/src/components/global/Location'
import {
  Button,
  Code,
  DateInput,
  DatePicker,
  Divider,
  Link,
  semanticColors,
} from '@heroui/react'
import PayrollCreateValueCell from '@/src/components/payrolls/create/PayrollCreateValueCell'
import PayrollCreateWorkerCell from '@/src/components/payrolls/create/PayrollCreateWorkerCell'
import PayrollCreateLocationCell from '@/src/components/payrolls/create/PayrollCreateLocationCell'
import {ArrowLeft, CheckCircle, CloseCircle, Plain, Ruble} from 'solar-icon-set'
import {DateTime, Interval} from 'luxon'
import {useTheme} from 'next-themes'
import {parseDate} from '@internationalized/date'
import fetchHandler from '@/src/utils/global/fetchHandler'

interface PayrollCreatePageProps {
  data: {
    name: LTWorker['name']
    id: LTWorker['id']
    rank: LTRank['name']
    value: number | null
    bonuses?: number
    fines?: number
  }[]
  dates: {start: string; end: string}
  bonuses: boolean
  moneyOnLocations: {
    location: LTLocation['id']
    value: number
  }[]
  locations: LTLocation[]
}

const locationsToHide = ['выезд', 'другое', 'отдел продаж']

export default function PayrollCreatePage({
  data,
  dates,
  bonuses,
  moneyOnLocations,
  locations,
}: PayrollCreatePageProps) {
  const {theme} = useTheme()
  // @ts-ignore
  const themeColors = semanticColors[theme || 'dark']
  const [payrollData, setPayrollData] = useState<LTPayrollData[]>(
    data.map(d => ({
      workerId: d.id,
      location: -1,
      value: d.value || 0,
      fines: d.fines || 0,
      bonuses: d.bonuses || 0,
    })),
  )
  const [takeBy, setTakeBy] = useState<string>(
    DateTime.now().plus({day: 7}).toFormat('yyyy-MM-dd'),
  )

  const interval = useMemo(() => {
    return Interval.fromISO(`${dates.start}/${dates.end}`)
  }, [dates.start, dates.end])

  const sendData = useCallback(() => {
    const dataToSend: LTPayrollCreateData = {
      withBonuses: bonuses,
      workersData: payrollData,
      takeBy,
      dates,
    }

    console.debug(payrollData)
    // ;(async () =>
    //   fetchHandler({
    //     url: '/api/payrolls/create',
    //     method: 'POST',
    //     body: dataToSend,
    //   }))()
  }, [bonuses, dates, payrollData, takeBy])

  const handleUpdate = useCallback(
    (
      workerId: LTWorker['id'],
      value: number,
      type: 'location' | 'bonuses' | 'fines' | 'value',
    ) => {
      setPayrollData(prev =>
        prev.map(d => (d.workerId === workerId ? {...d, [type]: value} : d)),
      )
    },
    [],
  )
  return (
    <main className="p-4">
      <div className="flex items-center gap-2 pb-4">
        <Button as={Link} href="/payrolls" startContent={<ArrowLeft />}>
          Назад
        </Button>
        <div className="glass p-2">{interval.toFormat('dd.MM.yyyy')}</div>
        <div className="glass flex items-center gap-2 p-2">
          Бонусы:{' '}
          {bonuses ? (
            <CheckCircle
              iconStyle="Bold"
              color={themeColors.success['500']}
              size={20}
            />
          ) : (
            <CloseCircle
              iconStyle="Bold"
              size={20}
              color={themeColors.danger['500']}
            />
          )}
        </div>
      </div>
      <div className="flex gap-4">
        <div className="bg-content1 flex w-[90%] flex-col gap-2 rounded-2xl">
          <div className="bg-content2 sticky top-0 z-1000 flex items-center gap-2 rounded-xl p-2">
            <p className="flex-1 text-center">Сотрудник</p>
            <Divider orientation="vertical" />
            <p className="flex-1 text-center">Сумма</p>
            <Divider orientation="vertical" />
            {bonuses && (
              <>
                <p className="flex-1 text-center">Бонусы</p>
                <Divider orientation="vertical" />
                <p className="flex-1 text-center">Штрафы</p>
                <Divider orientation="vertical" />
                <p className="flex-1 text-center">Итог</p>
                <Divider orientation="vertical" />
              </>
            )}
            <p className="flex-1 text-center">Локация</p>
          </div>
          {data.map((d, index) => {
            const payrollWorkerData = payrollData[index]

            const summary =
              (payrollWorkerData.fines || 0) +
              (payrollWorkerData.bonuses || 0) +
              (Number(payrollWorkerData.value) || 0)

            return (
              <Fragment key={index}>
                <div className="flex items-center gap-2 p-2">
                  <PayrollCreateWorkerCell name={d.name} rank={d.rank} />
                  <Divider orientation="vertical" />
                  <PayrollCreateValueCell
                    data={d.value || 0}
                    workerId={d.id}
                    callback={handleUpdate}
                  />
                  <Divider orientation="vertical" />
                  {bonuses && (
                    <>
                      <PayrollCreateValueCell
                        data={d.bonuses || 0}
                        type="bonuses"
                        workerId={d.id}
                        callback={handleUpdate}
                      />
                      <Divider orientation="vertical" />
                      <PayrollCreateValueCell
                        type="fines"
                        data={d.fines || 0}
                        workerId={d.id}
                        callback={handleUpdate}
                      />
                      <Divider orientation="vertical" />
                      <div className="bg-content2 flex h-full flex-1 items-center justify-center gap-2 rounded-2xl">
                        <p>{summary}</p>
                        <Ruble iconStyle="Bold" />
                      </div>
                      <Divider orientation="vertical" />
                    </>
                  )}
                  <PayrollCreateLocationCell
                    locations={locations}
                    callback={handleUpdate}
                    workerId={d.id}
                  />
                </div>
                {index !== data.length - 1 ? <Divider /> : ''}
              </Fragment>
            )
          })}
        </div>
        <div className="sticky top-0 flex h-fit flex-col gap-2">
          <div className="glass grid auto-rows-auto grid-cols-3 gap-2 rounded-2xl p-2">
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
                const locationMoney =
                  moneyOnLocations.find(d => d.location === location.id)!
                    .value || 0

                const usedMoney = payrollData
                  .filter(d => d.location === location.id)
                  .reduce(
                    (acc, d) =>
                      acc +
                      Number(d.value) -
                      (Number(d.fines) || 0) +
                      (Number(d.bonuses) || 0),
                    0,
                  )

                return (
                  <Fragment key={location.id}>
                    <Divider className="col-span-full" />
                    <Location locationName={location.name} />
                    <Code color="primary">{locationMoney}</Code>
                    <Code
                      color={
                        locationMoney - usedMoney < 0 ? 'danger' : 'success'
                      }>
                      {locationMoney - usedMoney}
                    </Code>
                  </Fragment>
                )
              })}
          </div>
          <div className="glass p-2">
            <p>Можно забрать до</p>
            <DatePicker
              value={parseDate(takeBy)}
              onChange={d => setTakeBy(d?.toString() || '')}
            />
          </div>
          <div className="glass p-2">
            <Button
              startContent={<Plain size={24} />}
              className="col-span-full w-full"
              variant="shadow"
              color="primary"
              onPress={sendData}>
              Отправить
            </Button>
          </div>
        </div>
      </div>
    </main>
  )
}
