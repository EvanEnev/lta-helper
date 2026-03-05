import {
  Button,
  CalendarDate,
  Checkbox,
  DateRangePicker,
  Divider,
  Input,
  RangeValue,
  useDisclosure,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
} from '@heroui/react'
import {DateTime} from 'luxon'
import {Fragment, useEffect, useMemo, useState} from 'react'
import {parseDate} from '@internationalized/date'
import {LTLocation} from '@/src/utils/types'
import Location from '@/src/components/global/Location'
import Link from 'next/link'
import {evaluate} from 'mathjs'
import {Icon} from '@iconify/react'

interface PayrollsCreateCardProps {
  locations: LTLocation[]
}

const blacklistedLocations = ['другое', 'выезд', 'отдел продаж']

export default function PayrollCreateCard({
  locations,
}: PayrollsCreateCardProps) {
  const {isOpen, onOpen, onOpenChange} = useDisclosure()
  const [moneyOnLocations, setMoneyOnLocations] = useState<
    {location: LTLocation['id']; value: number; error?: boolean}[]
  >(locations.map(l => ({location: l.id, value: 0})))
  const [dateRange, setDateRange] = useState<RangeValue<CalendarDate> | null>(
    null,
  )
  const [actorsBonusesRange, setActorsBonusesRange] =
    useState<RangeValue<CalendarDate> | null>(null)
  const [workersBonusesRange, setWorkersBonusesRange] =
    useState<RangeValue<CalendarDate> | null>(null)

  const currentDate = useMemo(() => DateTime.now().setZone('Europe/Moscow'), [])

  const [bonuses, setBonuses] = useState<boolean>(false)

  useEffect(() => {
    if (currentDate.day > 20 || currentDate.day < 5) {
      const monthNumber =
        currentDate.day < 5 ? currentDate.month - 1 : currentDate.month

      const start = parseDate(
        currentDate
          .set({
            day: 16,
            month: monthNumber,
          })
          .toFormat('yyyy-MM-dd'),
      )

      const end = parseDate(
        currentDate
          .set({
            day: currentDate.set({month: monthNumber}).daysInMonth,
            month: monthNumber,
          })
          .toFormat('yyyy-MM-dd'),
      )

      // @ts-ignore
      setDateRange({start, end})
      // @ts-ignore
      setActorsBonusesRange({start, end})
    } else {
      const monthNumber = currentDate.month

      const start = parseDate(
        currentDate
          .set({
            day: 1,
            month: monthNumber,
          })
          .toFormat('yyyy-MM-dd'),
      )

      const end = parseDate(
        currentDate
          .set({
            day: 15,
            month: monthNumber,
          })
          .toFormat('yyyy-MM-dd'),
      )

      const workersStart = parseDate(
        currentDate
          .set({month: monthNumber - 1, day: 1})
          .toFormat('yyyy-MM-dd'),
      )

      const workersEnd = parseDate(
        currentDate
          .set({
            month: monthNumber - 1,
            day: currentDate.set({month: monthNumber - 1}).daysInMonth,
          })
          .toFormat('yyyy-MM-dd'),
      )
      // @ts-ignore
      setDateRange({start, end})
      // @ts-ignore
      setWorkersBonusesRange({start: workersStart, end: workersEnd})
      // @ts-ignore
      setActorsBonusesRange({start, end})
      setBonuses(true)
    }
  }, [currentDate])

  const filteredLocations = useMemo(
    () =>
      locations.filter(
        l => !blacklistedLocations.includes(l.name.toLowerCase()),
      ),
    [locations],
  )

  const existingAttempt = useMemo(() => {
    const localItem = localStorage.getItem('payrollsCreate')

    if (localItem) {
      return JSON.parse(localItem)
    }

    return null
  }, [])

  return (
    <>
      <Button
        variant="ghost"
        onPress={onOpen}
        className="flex h-[18rem] w-full flex-col gap-2 border-dashed text-2xl sm:w-[20rem]">
        <Icon icon="solar:add-circle-linear" width="50" height="50" />
        Создать
      </Button>
      <Modal
        isOpen={isOpen}
        onOpenChange={onOpenChange}
        className="h-[80%] min-w-[50%]">
        <ModalContent>
          {onClose => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                Создание ведомости
              </ModalHeader>
              <ModalBody className="h-[50%]">
                <p className="bg-content3 z-100 w-full rounded-xl p-2">
                  Диапазон дат
                </p>
                <DateRangePicker
                  // @ts-ignore
                  value={dateRange}
                  // @ts-ignore
                  onChange={value => setDateRange(value)}
                  aria-label="Диапазон дат"
                  labelPlacement="outside"
                />
                <Divider />
                <p className="bg-content3 z-100 w-full rounded-xl p-2">
                  Бонусы
                </p>
                <div className="flex gap-2">
                  <div className="flex flex-col gap-2">
                    <Checkbox isSelected>Актёры</Checkbox>
                    <DateRangePicker
                      // @ts-ignore
                      value={actorsBonusesRange}
                      // @ts-ignore
                      onChange={value => setActorsBonusesRange(value)}
                      aria-label="Диапазон дат бонусов актёров"
                      labelPlacement="outside"
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <Checkbox onValueChange={setBonuses} isSelected={bonuses}>
                      Инструкторы
                    </Checkbox>
                    <DateRangePicker
                      isDisabled={!bonuses}
                      // @ts-ignore
                      value={workersBonusesRange}
                      // @ts-ignore
                      onChange={value => setWorkersBonusesRange(value)}
                      aria-label="Диапазон дат бонусов актёров"
                      labelPlacement="outside"
                    />
                  </div>
                </div>
                <Divider />
                <div className="grid grid-flow-row auto-rows-auto grid-cols-3 gap-2 overflow-auto">
                  <p className="bg-content3 sticky top-0 z-100 col-span-full w-full rounded-xl p-2">
                    Зарплатные деньги на локациях
                  </p>
                  {filteredLocations.map(location => {
                    const moneyData = moneyOnLocations.find(
                      d => d.location === location.id,
                    )

                    return (
                      <Fragment key={location.id}>
                        <Location locationName={location.name} />
                        <Input
                          color={moneyData?.error ? 'danger' : 'default'}
                          onValueChange={value =>
                            setMoneyOnLocations(prev =>
                              prev.map(d => {
                                let newValue = null
                                try {
                                  newValue = evaluate(value)
                                } catch {}

                                return d.location === location.id
                                  ? {
                                      location: location.id,
                                      value: newValue || 0,
                                      error: newValue === null,
                                    }
                                  : d
                              }),
                            )
                          }
                          endContent={
                            <Icon
                              icon="solar:ruble-linear"
                              width="24"
                              height="24"
                            />
                          }
                          defaultValue={'0'}
                        />
                        <p className="bg-content2 flex rounded-xl p-2">
                          {moneyData?.value || 0}
                        </p>
                      </Fragment>
                    )
                  })}
                </div>
              </ModalBody>
              <ModalFooter>
                <Button color="danger" variant="light" onPress={onClose}>
                  Закрыть
                </Button>
                {existingAttempt && (
                  <Button color="success">
                    <Link
                      href={{
                        pathname: '/payrolls/create',
                        query: {
                          dates: JSON.stringify({
                            start: dateRange?.start.toString(),
                            end: dateRange?.end.toString(),
                          }),
                          moneyOnLocations: JSON.stringify(moneyOnLocations),
                          bonuses,
                          workersBonusesRange: JSON.stringify({
                            start: workersBonusesRange?.start.toString(),
                            end: workersBonusesRange?.end.toString(),
                          }),
                          actorsBonusesRange: JSON.stringify({
                            start: actorsBonusesRange?.start.toString(),
                            end: actorsBonusesRange?.end.toString(),
                          }),
                        },
                      }}>
                      Продолжить черновик
                    </Link>
                  </Button>
                )}
                <Button
                  color="primary"
                  onPress={() => localStorage.removeItem('payrollsCreate')}>
                  <Link
                    href={{
                      pathname: '/payrolls/create',
                      query: {
                        dates: JSON.stringify({
                          start: dateRange?.start.toString(),
                          end: dateRange?.end.toString(),
                        }),
                        moneyOnLocations: JSON.stringify(moneyOnLocations),
                        bonuses,
                        workersBonusesRange: JSON.stringify({
                          start: workersBonusesRange?.start.toString(),
                          end: workersBonusesRange?.end.toString(),
                        }),
                        actorsBonusesRange: JSON.stringify({
                          start: actorsBonusesRange?.start.toString(),
                          end: actorsBonusesRange?.end.toString(),
                        }),
                      },
                    }}>
                    Продолжить
                  </Link>
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </>
  )
}
