'use client'

import {
  Button,
  DatePicker,
  DateValue,
  Divider,
  Drawer,
  DrawerBody,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  NumberInput,
  Textarea,
  useDisclosure,
} from '@heroui/react'
import {DateInputGroup, TimeField, TimeValue} from '@heroui/react-beta'
import {
  BillCheck,
  BillCross,
  ChatRoundLine,
  ClockCircle,
  Eye,
  Gamepad,
  History,
  Ruble,
  SortByTime,
} from 'solar-icon-set'
import {LTGamePayment, LTLocation, SalaryData} from '@/src/utils/types'
import Location from '@/src/components/global/Location'
import {DateTime} from 'luxon'
import {useCallback, useMemo} from 'react'
import {parseDate, parseTime} from '@internationalized/date'
import DeleteButton from '@/src/components/global/DeleteButton'
import useIsMobile from '@/src/hooks/useIsMobile'
import LocationSelect from '@/src/components/global/LocationSelect'
import CellChip from '@/src/components/salary/CellChip'
import FormulaInput from '@/src/components/global/FormulaInput'

interface EditDrawerProps {
  data: SalaryData
  handleEdit: any
  handleDelete: any
  gamesPayments: LTGamePayment[]
  isReadOnly: boolean
  locations: LTLocation[]
  time: {start: string; end: string}
  overworkTime: {start: string | null; end: string | null}
  workerId: number
}

export default function EditDrawer({
  data,
  handleEdit,
  handleDelete,
  gamesPayments,
  isReadOnly,
  locations,
  time,
  overworkTime,
  workerId,
}: EditDrawerProps) {
  const {isOpen, onOpen, onOpenChange} = useDisclosure()
  const isMobile = useIsMobile()

  const salaryDate = useMemo(
    () => DateTime.fromFormat(data.date, 'dd.MM.yyyy'),
    [data.date],
  )

  const times = useMemo(() => {
    let startTime = time.start
    let endTime = time.end
    let overworkStartTime = overworkTime.start || null
    let overworkEndTime = overworkTime.end || null

    if (startTime.startsWith('24')) {
      startTime = startTime.replace('24', '00')
    }

    if (endTime.startsWith('24')) {
      endTime = endTime.replace('24', '00')
    }

    if (overworkStartTime?.startsWith('24')) {
      overworkStartTime = overworkStartTime.replace('24', '00')
    }

    if (overworkEndTime?.startsWith('24')) {
      overworkEndTime = overworkEndTime.replace('24', '00')
    }

    return {
      start: parseTime(startTime),
      end: parseTime(endTime),
      overworkStart: overworkStartTime ? parseTime(overworkStartTime) : null,
      overworkEnd: overworkEndTime ? parseTime(overworkEndTime) : null,
    }
  }, [overworkTime.end, overworkTime.start, time.end, time.start])

  const update = useCallback(
    (
      value:
        | string
        | {
            hour: number
            minute: number
          }
        | DateValue
        | null
        | {number: number | null; value: number | null; id: number | null}
        | TimeValue,
      type:
        | 'delete'
        | 'location'
        | 'date'
        | 'startTime'
        | 'endTime'
        | 'value'
        | 'bonuses'
        | 'fines'
        | 'overworkStart'
        | 'overworkEnd'
        | 'overworkValue'
        | 'comment'
        | 'actorGames'
        | 'oneGames'
        | 'twoGames'
        | 'threeGames',
    ) => {
      const newData: SalaryData = {...data}

      if (type === 'delete') {
        return handleDelete(newData)
      }

      if (
        ['startTime', 'endTime', 'overworkStart', 'overworkEnd'].includes(type)
      ) {
        value = value as TimeValue

        if (!value) {
          value = 'NULL'
        } else {
          const hours =
            value.hour.toString().length === 1 ? `0${value.hour}` : value.hour
          const minutes =
            value.minute.toString().length === 1
              ? `0${value.minute}`
              : value.minute

          value = `${hours}:${minutes}:00`
        }
      }

      if (type === 'date') {
        const newValue = value as DateValue | null
        if (!(newValue?.day && newValue?.year && newValue?.month)) {
          return
        }

        const newDate = DateTime.now()
          .setZone('Europe/Moscow')
          .set({day: newValue.day, month: newValue.month, year: newValue.year})

        value = newDate.toFormat('dd.MM.yyyy')
      }

      // @ts-ignore
      newData[type] = value

      handleEdit(newData, workerId)
    },
    [data, handleDelete, handleEdit, workerId],
  )

  return (
    <>
      <Button
        startContent={<Eye iconStyle="Bold" />}
        variant="faded"
        className="w-full"
        onPress={() => onOpen()}>
        Подробнее
      </Button>
      <Drawer
        placement={isMobile ? 'bottom' : 'right'}
        isOpen={isOpen}
        size="3xl"
        classNames={{wrapper: 'z-10000', backdrop: 'z-10000'}}
        className="min-h-[80%]"
        onOpenChange={onOpenChange}>
        <DrawerContent>
          {onClose => (
            <>
              <DrawerHeader
                className="flex flex-col gap-2"
                style={{backgroundColor: data.location.color}}>
                <div className="flex items-center gap-2">
                  <Location locationName={data.location.name || ''} />
                  <p>{data.date}</p>
                </div>
                <p className="text-foreground-500 text-s">
                  Проставлена: {data.createdBy} {data.createdAt}
                </p>
              </DrawerHeader>
              <DrawerBody className="grid grid-flow-row auto-rows-min grid-cols-2 gap-2">
                <div className="col-span-full flex items-center gap-1">
                  <ClockCircle size={22} />
                  <p>Смена</p>
                </div>
                <TimeField
                  // @ts-ignore
                  value={times.start}
                  onChange={value => update(value, 'startTime')}
                  isReadOnly={isReadOnly}
                  name="workStart">
                  <DateInputGroup
                    variant="secondary"
                    className="items-center justify-center">
                    <DateInputGroup.Input>
                      {segment => <DateInputGroup.Segment segment={segment} />}
                    </DateInputGroup.Input>
                  </DateInputGroup>
                </TimeField>
                <TimeField
                  // @ts-ignore
                  value={times.end}
                  onChange={value => update(value, 'endTime')}
                  isReadOnly={isReadOnly}
                  name="workStart">
                  <DateInputGroup
                    variant="secondary"
                    className="items-center justify-center">
                    <DateInputGroup.Input>
                      {segment => <DateInputGroup.Segment segment={segment} />}
                    </DateInputGroup.Input>
                  </DateInputGroup>
                </TimeField>
                <NumberInput
                  isReadOnly={isReadOnly}
                  isWheelDisabled
                  classNames={{stepperButton: 'hidden'}}
                  label="Сумма"
                  className="text-foreground col-span-2"
                  value={data.value ? Number(data.value) : 0}
                  onValueChange={value => update(value.toString(), 'value')}
                  minValue={0}
                  endContent={<Ruble iconStyle="Bold" />}
                />
                <Divider className="col-span-full w-full" />
                <div className="col-span-full flex items-center gap-1">
                  <History iconStyle="Bold" size={22} />
                  <p>Переработка</p>
                </div>
                <TimeField
                  // @ts-ignore
                  value={times.overworkStart}
                  onChange={value => update(value, 'overworkStart')}
                  isReadOnly={isReadOnly}
                  name="workStart">
                  <DateInputGroup
                    variant="secondary"
                    className="items-center justify-center">
                    <DateInputGroup.Input>
                      {segment => <DateInputGroup.Segment segment={segment} />}
                    </DateInputGroup.Input>
                  </DateInputGroup>
                </TimeField>
                <TimeField
                  // @ts-ignore
                  value={times.overworkEnd}
                  onChange={value => update(value, 'overworkEnd')}
                  isReadOnly={isReadOnly}
                  name="workStart">
                  <DateInputGroup
                    variant="secondary"
                    className="items-center justify-center">
                    <DateInputGroup.Input>
                      {segment => <DateInputGroup.Segment segment={segment} />}
                    </DateInputGroup.Input>
                  </DateInputGroup>
                </TimeField>
                <NumberInput
                  isReadOnly={isReadOnly}
                  isWheelDisabled
                  classNames={{stepperButton: 'hidden'}}
                  label="Сумма"
                  className="text-foreground col-span-2 w-full justify-self-end text-end text-xs"
                  value={data.overworkValue ? Number(data.overworkValue) : 0}
                  minValue={0}
                  onValueChange={value =>
                    update(value.toString(), 'overworkValue')
                  }
                  endContent={<Ruble iconStyle="Bold" />}
                />
                <Divider className="col-span-full" />
                <div className="col-span-full flex items-center gap-1">
                  <Gamepad iconStyle="Bold" size={22} />
                  <p>Игры</p>
                </div>
                <p className="col-span-full">1 часовые</p>
                <NumberInput
                  isReadOnly={isReadOnly}
                  classNames={{stepperButton: 'hidden'}}
                  label="Кол-во"
                  minValue={0}
                  isWheelDisabled
                  value={data.oneGames?.number || 0}
                  onValueChange={value => {
                    const paymentData = gamesPayments.find(
                      d => d.key === 'oneGames',
                    )

                    update(
                      {
                        id: paymentData?.id || null,
                        number: value,
                        value: (paymentData?.value || 0) * value,
                      },
                      'oneGames',
                    )
                  }}
                />
                <NumberInput
                  isReadOnly={isReadOnly}
                  classNames={{stepperButton: 'hidden'}}
                  label="Сумма"
                  minValue={0}
                  isWheelDisabled
                  onValueChange={value => {
                    const paymentData = gamesPayments.find(
                      d => d.key === 'oneGames',
                    )

                    update(
                      {
                        id: paymentData?.id || null,
                        number: data.oneGames?.number || null,
                        value,
                      },
                      'oneGames',
                    )
                  }}
                  value={data.oneGames?.value}
                />
                <p className="col-span-full">2-х часовые</p>
                <NumberInput
                  isReadOnly={isReadOnly}
                  classNames={{stepperButton: 'hidden'}}
                  label="Кол-во"
                  minValue={0}
                  isWheelDisabled
                  value={data.twoGames?.number || 0}
                  onValueChange={value => {
                    const paymentData = gamesPayments.find(
                      d => d.key === 'twoGames',
                    )

                    update(
                      {
                        id: paymentData?.id || null,
                        number: value,
                        value: (paymentData?.value || 0) * value,
                      },
                      'twoGames',
                    )
                  }}
                />
                <NumberInput
                  isReadOnly={isReadOnly}
                  classNames={{stepperButton: 'hidden'}}
                  label="Сумма"
                  minValue={0}
                  isWheelDisabled
                  onValueChange={value => {
                    const paymentData = gamesPayments.find(
                      d => d.key === 'twoGames',
                    )

                    update(
                      {
                        id: paymentData?.id || null,
                        number: data.twoGames?.number || null,
                        value,
                      },
                      'twoGames',
                    )
                  }}
                  value={data.twoGames?.value || 0}
                />
                <p className="col-span-full">3-х часовые</p>
                <NumberInput
                  isReadOnly={isReadOnly}
                  classNames={{stepperButton: 'hidden'}}
                  label="Кол-во"
                  minValue={0}
                  isWheelDisabled
                  value={data.threeGames?.number || 0}
                  onValueChange={value => {
                    const paymentData = gamesPayments.find(
                      d => d.key === 'threeGames',
                    )

                    update(
                      {
                        id: paymentData?.id || null,
                        number: value,
                        value: (paymentData?.value || 0) * value,
                      },
                      'threeGames',
                    )
                  }}
                />
                <NumberInput
                  isReadOnly={isReadOnly}
                  classNames={{stepperButton: 'hidden'}}
                  label="Сумма"
                  minValue={0}
                  isWheelDisabled
                  onValueChange={value => {
                    const paymentData = gamesPayments.find(
                      d => d.key === 'threeGames',
                    )

                    update(
                      {
                        id: paymentData?.id || null,
                        number: data.threeGames?.number || null,
                        value,
                      },
                      'threeGames',
                    )
                  }}
                  value={data.threeGames?.value || 0}
                />
                <p className="col-span-full">Актёрские</p>
                <NumberInput
                  isReadOnly={isReadOnly}
                  classNames={{stepperButton: 'hidden'}}
                  label="Кол-во"
                  minValue={0}
                  isWheelDisabled
                  value={data.actorGames?.number || 0}
                  onValueChange={value => {
                    const paymentData = gamesPayments.find(
                      d => d.key === 'actorGames',
                    )

                    update(
                      {
                        id: paymentData?.id || null,
                        number: value,
                        value: (paymentData?.value || 0) * value,
                      },
                      'actorGames',
                    )
                  }}
                />
                <NumberInput
                  isReadOnly={isReadOnly}
                  classNames={{stepperButton: 'hidden'}}
                  label="Сумма"
                  minValue={0}
                  isWheelDisabled
                  onValueChange={value => {
                    const paymentData = gamesPayments.find(
                      d => d.key === 'actorGames',
                    )

                    update(
                      {
                        id: paymentData?.id || null,
                        number: data.actorGames?.number || null,
                        value,
                      },
                      'actorGames',
                    )
                  }}
                  value={data.actorGames?.value || 0}
                />
                <Divider className="col-span-full" />
                <div className="col-span-full flex items-center gap-1">
                  <BillCheck iconStyle="Bold" size={22} />
                  <p>Бонусы</p>
                </div>
                <FormulaInput
                  className="col-span-full w-full justify-self-end text-end"
                  ariaLabel="Бонусы"
                  callback={({text, error}) => {
                    if (error) return

                    update(text, 'bonuses')
                  }}
                  value={data.bonuses || ''}
                />
                <div className="col-span-full flex items-center gap-1">
                  <BillCross iconStyle="Bold" size={22} />
                  <p>Штрафы</p>
                </div>
                <FormulaInput
                  className="col-span-full w-full justify-self-end text-end"
                  ariaLabel="Штрафы"
                  callback={({text, error}) => {
                    if (error) return

                    update(text, 'fines')
                  }}
                  value={data.fines || ''}
                />
                <Divider className="col-span-full" />
                <p className="col-span-full w-full">
                  <ChatRoundLine
                    iconStyle="Bold"
                    className="mr-1 align-middle"
                  />
                  Комментарий
                </p>
                <Textarea
                  isReadOnly={isReadOnly}
                  aria-label="Комментарий"
                  classNames={{
                    innerWrapper: 'min-h-[4.5rem] items-center justify-center',
                    input: 'h-full',
                  }}
                  style={{height: 'fit-content'}}
                  className="col-span-2"
                  value={data.comment || ''}
                  onValueChange={value => update(value, 'comment')}
                />
                <p className="col-span-full w-full">
                  <SortByTime iconStyle="Bold" className="mr-1 align-middle" />
                  FaceID
                </p>
                {data.faceId?.map(data => (
                  <>
                    <CellChip>
                      <Location locationName={data.location.name} />
                    </CellChip>
                    <CellChip>{data.timestamp}</CellChip>
                  </>
                ))}
                {!isReadOnly && (
                  <>
                    <Divider className="col-span-full" />
                    <DatePicker
                      label="Дата смены"
                      className="col-span-2"
                      onChange={value => update(value, 'date')}
                      // @ts-ignore
                      value={parseDate(salaryDate.toFormat('yyyy-MM-dd'))}
                    />
                    <DeleteButton
                      callback={() => update('', 'delete')}
                      className="col-span-2 h-full w-full"
                    />
                    <div className="col-span-2">
                      <LocationSelect
                        locations={locations}
                        labelPlacement="inside"
                        callback={(location: any) =>
                          update(location, 'location')
                        }
                        locationId={data.location.id}
                      />
                    </div>
                  </>
                )}
              </DrawerBody>
              <DrawerFooter>
                <Button
                  className="w-full"
                  color="danger"
                  variant="ghost"
                  onPress={onClose}>
                  Закрыть
                </Button>
              </DrawerFooter>
            </>
          )}
        </DrawerContent>
      </Drawer>
    </>
  )
}
