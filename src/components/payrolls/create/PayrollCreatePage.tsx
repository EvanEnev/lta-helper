'use client'

import {
  LTLocation,
  LTPayrollCreateData,
  LTPayrollData,
  LTRank,
  LTWorker,
} from '@/src/utils/types'
import {
  Fragment,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import {
  Button,
  Checkbox,
  Code,
  Divider,
  Link,
  semanticColors,
} from '@heroui/react'
import PayrollCreateValueCell from '@/src/components/payrolls/create/PayrollCreateValueCell'
import PayrollCreateWorkerCell from '@/src/components/payrolls/create/PayrollCreateWorkerCell'
import PayrollCreateLocationCell from '@/src/components/payrolls/create/PayrollCreateLocationCell'
import {
  ArrowLeft,
  CheckCircle,
  CloseCircle,
  CloseSquare,
  Ruble,
} from 'solar-icon-set'
import {DateTime, Interval} from 'luxon'
import {useTheme} from 'next-themes'
import fetchHandler from '@/src/utils/global/fetchHandler'
import {evaluate} from 'mathjs'
import PayrollCreateNote from '@/src/components/payrolls/create/PayrollCreateNote'
import {useRouter} from 'next/navigation'
import separateNumber from '@/lib/functions/separateNumber'

interface PayrollCreatePageProps {
  data: {
    name: LTWorker['name']
    id: LTWorker['id']
    rank: LTRank['name']
    sum: number
    balance: number
    value: number
    overwork: number
    bonuses: number
    fines: number
    external: number
    games: number
  }[]
  dates: {start: string; end: string}
  bonuses: boolean
  moneyOnLocations: {
    location: LTLocation['id']
    value: number
  }[]
  locations: LTLocation[]
}

const locationsToHide = ['выезд', 'отдел продаж']

export default function PayrollCreatePage({
  data: initialData,
  dates: initialDates,
  bonuses: initialBonuses,
  moneyOnLocations: initialMoney,
  locations,
}: PayrollCreatePageProps) {
  const router = useRouter()
  const [data, setData] = useState(initialData)
  const headerRef = useRef<HTMLDivElement | null>(null)

  const {theme} = useTheme()
  // @ts-ignore
  const themeColors = semanticColors[theme || 'dark']
  const [payrollData, setPayrollData] = useState<LTPayrollData[]>(
    JSON.parse(localStorage.getItem('payrollsCreate') || '{}')?.workersData ||
      data.map(d => {
        return {
          workerId: d.id,
          external_payment: d.external,
          location: -1,
          value: d.value + d.overwork + d.games,
          fines: d.fines,
          bonuses: d.bonuses,
          balance: d.balance,
        }
      }),
  )

  const [takeBy, setTakeBy] = useState<string>(
    JSON.parse(localStorage.getItem('payrollsCreate') || '{}')?.takeBy ||
      DateTime.now().plus({day: 7}).toFormat('yyyy-MM-dd'),
  )
  const [selectedRows, setSelectedRows] = useState<number[]>([])
  const [lastSelectedRow, setLastSelectedRow] = useState<number | null>(null)
  const [moneyOnLocations, setMoneyOnLocations] = useState<
    {
      location: LTLocation['id']
      value: number
      error?: boolean
    }[]
  >(
    JSON.parse(localStorage.getItem('payrollsCreate') || '{}')
      ?.moneyOnLocations || initialMoney,
  )

  const dates = useMemo(
    () =>
      JSON.parse(localStorage.getItem('payrollsCreate') || '{}')?.dates ||
      initialDates,
    [initialDates],
  )

  const bonuses = useMemo(
    () =>
      JSON.parse(localStorage.getItem('payrollsCreate') || '{}')?.bonuses ||
      initialBonuses,
    [initialBonuses],
  )

  const interval = useMemo(() => {
    return Interval.fromISO(`${dates.start}/${dates.end}`)
  }, [dates.start, dates.end])

  const updateLocationMoney = useCallback(
    (locationId: number, rawValue: string) => {
      let value = null
      try {
        value = evaluate(rawValue)
      } catch {}

      setMoneyOnLocations(prev =>
        prev.map(d =>
          d.location === locationId
            ? value === null
              ? {location: locationId, value: d.value, error: true}
              : {location: locationId, value}
            : d,
        ),
      )
    },
    [],
  )

  useEffect(() => {
    const data = {
      withBonuses: bonuses,
      workersData: payrollData,
      takeBy,
      dates,
      moneyOnLocations,
    }

    localStorage.setItem('payrollsCreate', JSON.stringify(data))
  }, [bonuses, dates, moneyOnLocations, payrollData, takeBy])

  const sendData = useCallback(async () => {
    const dataToSend: LTPayrollCreateData = {
      withBonuses: bonuses,
      workersData: payrollData,
      takeBy,
      dates,
      moneyOnLocations,
    }

    const result = await fetchHandler({
      url: '/api/payrolls/create',
      method: 'POST',
      body: dataToSend,
    })

    if (result?.id) {
      localStorage.removeItem('payrollsCreate')
      router.push(`/payrolls/${result.id}`)
    }
  }, [bonuses, dates, moneyOnLocations, payrollData, router, takeBy])

  const handleUpdate = useCallback(
    (
      workerId: LTWorker['id'],
      value: number,
      type: 'location' | 'bonuses' | 'fines' | 'value' | 'external_payment',
    ) => {
      const index = data.findIndex(d => d.id === workerId)

      if (selectedRows.length && selectedRows.includes(index)) {
        const dataToCheck = data.filter((_, index) =>
          selectedRows.includes(index),
        )
        setPayrollData(prev =>
          prev.map(d =>
            dataToCheck.find(d2 => d2.id === d.workerId) !== undefined
              ? {...d, [type]: value}
              : d,
          ),
        )
      } else {
        setPayrollData(prev =>
          prev.map(d => (d.workerId === workerId ? {...d, [type]: value} : d)),
        )
      }
    },
    [data, selectedRows],
  )

  const checkboxChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>, rowIndex: number) => {
      // @ts-ignore
      const withShift = e.nativeEvent.shiftKey

      if (lastSelectedRow !== null && withShift) {
        let selected = [...selectedRows]
        for (let i = lastSelectedRow + 1; i <= rowIndex; i++) {
          if (selected.includes(i)) {
            selected = selected.filter(d => d !== i)
          } else {
            selected.push(i)
          }
        }

        const newSelected = new Set(selected)

        setSelectedRows(Array.from(newSelected))
        setLastSelectedRow(null)
      } else {
        if (!selectedRows.includes(rowIndex)) {
          setSelectedRows(prev => [...prev, rowIndex])
        } else {
          setSelectedRows(prev => prev.filter(d => d !== rowIndex))
        }

        setLastSelectedRow(rowIndex)
      }
    },
    [lastSelectedRow, selectedRows],
  )

  const locationsFilter = useCallback(
    (value: boolean) => {
      if (!value) {
        setData(initialData)
      } else {
        setData(prev =>
          prev.filter(
            d => payrollData.find(d2 => d2.workerId === d.id)?.location === -1,
          ),
        )
      }
    },
    [initialData, payrollData],
  )

  const generateSum = useCallback(
    (names: string[]) => {
      let sum = payrollData.reduce(
        // @ts-ignore
        (acc, data) =>
          acc +
          names
            .map(n => {
              // @ts-ignore
              let value = data[n] || 0

              if (n === 'external_payment' && names.length > 1) {
                value *= -1
              }

              return value
            })
            .reduce((a, b) => a + b, 0),
        0,
      )

      return separateNumber(sum)
    },
    [payrollData],
  )

  return (
    <main className="h-full w-full p-4">
      <div
        ref={headerRef}
        className="sticky top-2 z-1000 flex items-center gap-2 pb-4">
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
        <div className="glass flex items-center gap-2 p-2">
          <p>Сотрудники:</p>
          <Code color="success" className="flex items-center gap-2">
            {payrollData.reduce(
              (acc, cur) =>
                acc +
                ((cur.fines || 0) +
                  Number(cur.value || 0) +
                  (cur.bonuses || 0) -
                  (cur.external_payment || 0)),
              0,
            )}
            <Ruble iconStyle="Bold" />
          </Code>
        </div>
        <div className="glass flex items-center gap-2 p-2">
          <p>Площадки:</p>
          <Code color="primary" className="flex items-center gap-2">
            {moneyOnLocations.reduce((acc, cur) => acc + cur.value, 0)}
            <Ruble iconStyle="Bold" />
          </Code>
        </div>
      </div>
      <div className="flex gap-4">
        <div className="bg-content1 flex flex-col gap-2 rounded-2xl">
          <div className="flex justify-end p-2">
            <Checkbox onValueChange={locationsFilter}>Пустые</Checkbox>
          </div>
          <div
            className="bg-content2 sticky z-1000 flex items-center gap-2 rounded-xl p-2"
            style={{top: `${headerRef?.current?.offsetHeight}px`}}>
            <Button
              className="max-w-7 min-w-7"
              onPress={() => {
                setLastSelectedRow(null)
                setSelectedRows([])
              }}
              startContent={<CloseSquare iconStyle="Bold" />}
              isIconOnly
            />
            <p className="min-w-32 flex-1 text-center">Сотрудник</p>
            <Divider orientation="vertical" />
            <div className="min-w-32 flex-1 text-center">
              <p>Сумма</p>
              <p className="text-foreground-500">{generateSum(['value'])}</p>
            </div>
            <Divider orientation="vertical" />
            <div className="min-w-32 flex-1 text-center">
              <p>Бонусы</p>
              <p className="text-foreground-500">{generateSum(['bonuses'])}</p>
            </div>
            <Divider orientation="vertical" />
            <div className="min-w-32 flex-1 text-center">
              <p>Штрафы</p>
              <p className="text-foreground-500">{generateSum(['fines'])}</p>
            </div>
            <Divider orientation="vertical" />
            <div className="min-w-32 flex-1 text-center">
              <p>Остаток</p>
              <p className="text-foreground-500">{generateSum(['balance'])}</p>
            </div>
            <Divider orientation="vertical" />
            <div className="min-w-32 flex-1 text-center">
              <p>Внешняя выплата</p>
              <p className="text-foreground-500">
                {generateSum(['external_payment'])}
              </p>
            </div>
            <Divider orientation="vertical" />
            <div className="min-w-32 flex-1 text-center">
              <p>Итог</p>
              <p className="text-foreground-500">
                {generateSum([
                  'fines',
                  'bonuses',
                  'value',
                  'external_payment',
                  'balance',
                ])}
              </p>
            </div>
            <Divider orientation="vertical" />
            <p className="flex-1 text-center">Локация</p>
          </div>
          {payrollData.map((payrollWorkerData, index) => {
            const d = data.find(d2 => d2.id === payrollWorkerData.workerId)!

            if (!d) return null

            const summary =
              (payrollWorkerData?.fines || 0) +
              (payrollWorkerData?.bonuses || 0) +
              (Number(payrollWorkerData?.value) || 0) -
              (payrollWorkerData?.external_payment || 0) +
              (payrollWorkerData?.balance || 0)

            return (
              <Fragment key={index}>
                <div className="flex items-center gap-2 p-2">
                  <Checkbox
                    onChange={e => checkboxChange(e, index)}
                    isSelected={selectedRows.includes(index)}
                  />
                  <PayrollCreateWorkerCell name={d.name} rank={d.rank} />
                  <Divider orientation="vertical" />
                  <PayrollCreateValueCell
                    data={payrollWorkerData?.value || 0}
                    workerId={d.id}
                    callback={handleUpdate}
                  />
                  <Divider orientation="vertical" />
                  <PayrollCreateValueCell
                    minValue={0}
                    data={payrollWorkerData?.bonuses || 0}
                    type="bonuses"
                    workerId={d.id}
                    callback={handleUpdate}
                  />
                  <Divider orientation="vertical" />
                  <PayrollCreateValueCell
                    type="fines"
                    data={payrollWorkerData?.fines || 0}
                    workerId={d.id}
                    callback={handleUpdate}
                  />
                  <Divider orientation="vertical" />
                  <div className="bg-content2 flex h-full min-w-32 flex-1 items-center justify-center gap-2 rounded-2xl">
                    <p>{separateNumber(d.balance || 0)}</p>
                    <Ruble iconStyle="Bold" />
                  </div>
                  <Divider orientation="vertical" />
                  <PayrollCreateValueCell
                    minValue={0}
                    data={payrollWorkerData?.external_payment || 0}
                    type="external_payment"
                    workerId={d.id}
                    callback={handleUpdate}
                  />
                  <Divider orientation="vertical" />
                  <div className="bg-content2 flex h-full min-w-32 flex-1 items-center justify-center gap-2 rounded-2xl">
                    <p>{separateNumber(summary)}</p>
                    <Ruble iconStyle="Bold" />
                  </div>
                  <Divider orientation="vertical" />
                  <PayrollCreateLocationCell
                    locationId={payrollWorkerData?.location || -1}
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
        <PayrollCreateNote
          locations={locations}
          locationsToHide={locationsToHide}
          moneyOnLocations={moneyOnLocations}
          payrollData={payrollData}
          updateLocationMoneyCallback={updateLocationMoney}
          sendDataCallback={sendData}
          takeBy={takeBy}
          setTakeBy={val => setTakeBy(val)}
        />
      </div>
    </main>
  )
}
