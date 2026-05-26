import {
  Button,
  Separator,
  RangeValue,
  Modal,
  useOverlayState,
  DateValue,
  Spinner,
} from '@heroui/react'
import {DateTime} from 'luxon'
import {useEffect, useMemo, useState} from 'react'
import {parseDate} from '@internationalized/date'
import Link from 'next/link'
import {Icon} from '@iconify/react'
import CalendarPicker from '@/src/components/payrolls/CalendarPicker'

export default function PayrollCreateCard() {
  const [isPending, setIsPending] = useState(false)
  const state = useOverlayState()

  const [dateRange, setDateRange] = useState<RangeValue<DateValue> | null>(null)
  const [actorsBonusesRange, setActorsBonusesRange] =
    useState<RangeValue<DateValue> | null>(null)
  const [workersBonusesRange, setWorkersBonusesRange] =
    useState<RangeValue<DateValue> | null>(null)

  const currentDate = useMemo(() => DateTime.now().setZone('Europe/Moscow'), [])

  const [bonuses, setBonuses] = useState<boolean>(false)

  useEffect(() => {
    if (currentDate.day > 25 || currentDate.day < 10) {
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

  const existingAttempt = useMemo(() => {
    const localItem = localStorage.getItem('payrollsCreate')

    if (localItem) {
      return JSON.parse(localItem)
    }

    return null
  }, [])

  return (
    <Modal isOpen={state.isOpen} onOpenChange={state.setOpen}>
      <Button
        variant="outline"
        onPress={state.open}
        slot="icon"
        className="flex h-72 w-full flex-col gap-2 border-2 p-6 text-2xl sm:w-[20rem]">
        <Icon icon="solar:add-circle-linear" width="50" height="50" />
        Создать
      </Button>
      <Modal.Backdrop>
        <Modal.Container>
          <Modal.Dialog>
            <Modal.CloseTrigger />
            <Modal.Header>Создание ведомости</Modal.Header>
            <Modal.Body className="flex flex-col gap-2 p-2">
              <CalendarPicker
                value={dateRange}
                callback={setDateRange}
                label="Диапазон дат"
              />
              <Separator />
              <CalendarPicker
                isClearable
                value={actorsBonusesRange}
                callback={setActorsBonusesRange}
                label="Бонусы актёров"
              />
              <CalendarPicker
                isClearable
                value={workersBonusesRange}
                callback={setWorkersBonusesRange}
                label="Бонусы инструкторов"
              />
            </Modal.Body>
            <Modal.Footer className="justify-center">
              {existingAttempt && (
                <Button
                  isPending={isPending}
                  onPress={() => setIsPending(true)}
                  className="w-full"
                  variant="outline">
                  {({isPending}) => (
                    <>
                      {isPending && <Spinner color="current" size="sm" />}
                      <Link
                        href={{
                          pathname: '/payrolls/create',
                          query: {
                            dates: JSON.stringify({
                              start: dateRange?.start.toString(),
                              end: dateRange?.end.toString(),
                            }),
                            moneyOnLocations: JSON.stringify([]),
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
                    </>
                  )}
                </Button>
              )}
              <Button
                className="w-full"
                variant="primary"
                isPending={isPending}
                onPress={() => {
                  setIsPending(true)
                  localStorage.removeItem('payrollsCreate')
                }}>
                {({isPending}) => (
                  <>
                    {isPending && <Spinner color="current" size="sm" />}
                    <Link
                      href={{
                        pathname: '/payrolls/create',
                        query: {
                          dates: JSON.stringify({
                            start: dateRange?.start.toString(),
                            end: dateRange?.end.toString(),
                          }),
                          moneyOnLocations: JSON.stringify([]),
                          bonuses:
                            Boolean(
                              workersBonusesRange?.start.toString().length,
                            ) &&
                            Boolean(workersBonusesRange?.end.toString().length),
                          workersBonusesRange: JSON.stringify({
                            start: workersBonusesRange?.start.toString().length
                              ? workersBonusesRange.start.toString()
                              : null,
                            end: workersBonusesRange?.end.toString().length
                              ? workersBonusesRange.end.toString()
                              : null,
                          }),
                          actorsBonusesRange: JSON.stringify({
                            start: actorsBonusesRange?.start.toString(),
                            end: actorsBonusesRange?.end.toString(),
                          }),
                        },
                      }}>
                      Продолжить
                    </Link>
                  </>
                )}
              </Button>
            </Modal.Footer>
          </Modal.Dialog>
        </Modal.Container>
      </Modal.Backdrop>
    </Modal>
  )
}
