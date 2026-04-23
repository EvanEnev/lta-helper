'use client'

import {
  Button,
  DatePicker,
  DateValue,
  Separator,
  Drawer,
  NumberField,
  TextArea,
  DateField,
  TimeField,
  TimeValue,
  Label,
  Calendar,
} from '@heroui/react'
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
import {Icon} from '@iconify/react'

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
      <Drawer>
        <Button slot="icon" variant="tertiary" className="w-full">
          <Icon icon="solar:eye-bold" width="24" height="24" />
          Подробнее
        </Button>
        <Drawer.Backdrop className="z-1000">
          <Drawer.Content
            className="min-h-[80%]"
            placement={isMobile ? 'bottom' : 'right'}>
            <Drawer.Dialog>
              <Drawer.Handle />
              <Drawer.CloseTrigger />
              <Drawer.Header
                className="flex flex-col gap-2 rounded-2xl p-2"
                style={{backgroundColor: data.location.color}}>
                <Drawer.Heading>
                  <div className="flex items-center gap-2">
                    <Location locationName={data.location.name || ''} />
                    <p>{data.date}</p>
                  </div>
                  <p className="text-foreground-500 text-s">
                    Проставлена: {data.createdBy} {data.createdAt}
                  </p>
                </Drawer.Heading>
              </Drawer.Header>
              <Drawer.Body className="grid grid-flow-row auto-rows-min grid-cols-2 gap-2">
                <div className="col-span-full flex items-center gap-1">
                  <Icon
                    icon="solar:clock-circle-linear"
                    width="22"
                    height="22"
                  />
                  <p>Смена</p>
                </div>
                <TimeField
                  value={times.start}
                  onChange={value => update(value, 'startTime')}
                  isReadOnly={isReadOnly}
                  name="workStart">
                  <DateField.Group
                    variant="secondary"
                    className="items-center justify-center">
                    <DateField.Input>
                      {segment => <DateField.Segment segment={segment} />}
                    </DateField.Input>
                  </DateField.Group>
                </TimeField>
                <TimeField
                  value={times.end}
                  onChange={value => update(value, 'endTime')}
                  isReadOnly={isReadOnly}
                  name="workStart">
                  <DateField.Group
                    variant="secondary"
                    className="items-center justify-center">
                    <DateField.Input>
                      {segment => <DateField.Segment segment={segment} />}
                    </DateField.Input>
                  </DateField.Group>
                </TimeField>
                <NumberField
                  variant="secondary"
                  isReadOnly={isReadOnly}
                  isWheelDisabled
                  className="text-foreground col-span-2"
                  value={data.value ? Number(data.value) : 0}
                  onChange={value => update(value.toString(), 'value')}
                  minValue={0}>
                  <Label>Сумма</Label>
                  <NumberField.Group className="flex px-2">
                    <NumberField.Input className="flex-1" />
                    <Icon icon="solar:ruble-bold" width="24" height="24" />
                  </NumberField.Group>
                </NumberField>
                <Separator className="col-span-full w-full" />
                <div className="col-span-full flex items-center gap-1">
                  <Icon icon="solar:history-bold" width="22" height="22" />
                  <p>Переработка</p>
                </div>
                <TimeField
                  value={times.overworkStart}
                  onChange={value => update(value, 'overworkStart')}
                  isReadOnly={isReadOnly}
                  name="workStart">
                  <DateField.Group
                    variant="secondary"
                    className="items-center justify-center">
                    <DateField.Input>
                      {segment => <DateField.Segment segment={segment} />}
                    </DateField.Input>
                  </DateField.Group>
                </TimeField>
                <TimeField
                  value={times.overworkEnd}
                  onChange={value => update(value, 'overworkEnd')}
                  isReadOnly={isReadOnly}
                  name="workStart">
                  <DateField.Group
                    variant="secondary"
                    className="items-center justify-center">
                    <DateField.Input>
                      {segment => <DateField.Segment segment={segment} />}
                    </DateField.Input>
                  </DateField.Group>
                </TimeField>
                <NumberField
                  variant="secondary"
                  isReadOnly={isReadOnly}
                  isWheelDisabled
                  className="text-foreground col-span-2"
                  value={data.overworkValue ? Number(data.overworkValue) : 0}
                  onChange={value => update(value.toString(), 'overworkValue')}
                  minValue={0}>
                  <Label>Сумма</Label>
                  <NumberField.Group className="flex px-2">
                    <NumberField.Input className="flex-1" />
                    <Icon icon="solar:ruble-bold" width="24" height="24" />
                  </NumberField.Group>
                </NumberField>
                <Separator className="col-span-full" />
                <div className="col-span-full flex items-center gap-1">
                  <Icon icon="solar:gamepad-bold" width="22" height="22" />
                  <p>Игры</p>
                </div>
                <p className="col-span-full">1 часовые</p>
                <NumberField
                  variant="secondary"
                  isReadOnly={isReadOnly}
                  isWheelDisabled
                  className="text-foreground col-span-2"
                  value={data.oneGames?.number || 0}
                  onChange={value => {
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
                  minValue={0}>
                  <Label>Кол-во</Label>
                  <NumberField.Group className="flex px-2">
                    <NumberField.Input className="flex-1" />
                    <Icon icon="solar:ruble-bold" width="24" height="24" />
                  </NumberField.Group>
                </NumberField>
                <NumberField
                  variant="secondary"
                  isReadOnly={isReadOnly}
                  isWheelDisabled
                  className="text-foreground col-span-2"
                  value={data.oneGames?.value}
                  onChange={value => {
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
                  minValue={0}>
                  <Label>Сумма</Label>
                  <NumberField.Group className="flex px-2">
                    <NumberField.Input className="flex-1" />
                    <Icon icon="solar:ruble-bold" width="24" height="24" />
                  </NumberField.Group>
                </NumberField>
                <p className="col-span-full">2-х часовые</p>
                <NumberField
                  variant="secondary"
                  isReadOnly={isReadOnly}
                  isWheelDisabled
                  className="text-foreground col-span-2"
                  value={data.twoGames?.number || 0}
                  onChange={value => {
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
                  minValue={0}>
                  <Label>Кол-во</Label>
                  <NumberField.Group className="flex px-2">
                    <NumberField.Input className="flex-1" />
                    <Icon icon="solar:ruble-bold" width="24" height="24" />
                  </NumberField.Group>
                </NumberField>
                <NumberField
                  variant="secondary"
                  isReadOnly={isReadOnly}
                  isWheelDisabled
                  className="text-foreground col-span-2"
                  value={data.twoGames?.value}
                  onChange={value => {
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
                  minValue={0}>
                  <Label>Сумма</Label>
                  <NumberField.Group className="flex px-2">
                    <NumberField.Input className="flex-1" />
                    <Icon icon="solar:ruble-bold" width="24" height="24" />
                  </NumberField.Group>
                </NumberField>
                <p className="col-span-full">3-х часовые</p>
                <NumberField
                  variant="secondary"
                  isReadOnly={isReadOnly}
                  isWheelDisabled
                  className="text-foreground col-span-2"
                  value={data.threeGames?.number || 0}
                  onChange={value => {
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
                  minValue={0}>
                  <Label>Кол-во</Label>
                  <NumberField.Group className="flex px-2">
                    <NumberField.Input className="flex-1" />
                    <Icon icon="solar:ruble-bold" width="24" height="24" />
                  </NumberField.Group>
                </NumberField>
                <NumberField
                  variant="secondary"
                  isReadOnly={isReadOnly}
                  isWheelDisabled
                  className="text-foreground col-span-2"
                  value={data.threeGames?.value}
                  onChange={value => {
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
                  minValue={0}>
                  <Label>Сумма</Label>
                  <NumberField.Group className="flex px-2">
                    <NumberField.Input className="flex-1" />
                    <Icon icon="solar:ruble-bold" width="24" height="24" />
                  </NumberField.Group>
                </NumberField>
                <p className="col-span-full">Актёрские</p>
                <NumberField
                  variant="secondary"
                  isReadOnly={isReadOnly}
                  isWheelDisabled
                  className="text-foreground col-span-2"
                  value={data.actorGames?.number || 0}
                  onChange={value => {
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
                  minValue={0}>
                  <Label>Кол-во</Label>
                  <NumberField.Group className="flex px-2">
                    <NumberField.Input className="flex-1" />
                    <Icon icon="solar:ruble-bold" width="24" height="24" />
                  </NumberField.Group>
                </NumberField>
                <NumberField
                  variant="secondary"
                  isReadOnly={isReadOnly}
                  isWheelDisabled
                  className="text-foreground col-span-2"
                  value={data.actorGames?.value}
                  onChange={value => {
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
                  minValue={0}>
                  <Label>Сумма</Label>
                  <NumberField.Group className="flex px-2">
                    <NumberField.Input className="flex-1" />
                    <Icon icon="solar:ruble-bold" width="24" height="24" />
                  </NumberField.Group>
                </NumberField>
                <Separator className="col-span-full" />
                <div className="col-span-full flex items-center gap-1">
                  <Icon icon="solar:bill-check-bold" width="22" height="22" />
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
                  <Icon icon="solar:bill-cross-bold" width="22" height="22" />
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
                <Separator className="col-span-full" />
                <p className="col-span-full w-full">
                  <Icon
                    icon="solar:chat-round-line-bold"
                    width="22"
                    height="22"
                    className="mr-1 align-middle"
                  />
                  Комментарий
                </p>
                <TextArea
                  variant="secondary"
                  readOnly={isReadOnly}
                  aria-label="Комментарий"
                  style={{height: 'fit-content'}}
                  className="col-span-2"
                  value={data.comment || ''}
                  onChange={e => update(e.target.value, 'comment')}
                />
                <p className="col-span-full w-full">
                  <Icon
                    icon="solar:sort-by-time-bold"
                    width="24"
                    height="24"
                    className="mr-1 align-middle"
                  />
                  FaceID
                </p>
                {data.faceId?.map(data => (
                  <>
                    <CellChip className="bg-default">
                      <Location locationName={data.location.name} />
                    </CellChip>
                    <CellChip className="bg-default">{data.timestamp}</CellChip>
                  </>
                ))}
                {!isReadOnly && (
                  <>
                    <Separator className="col-span-full" />
                    <DatePicker
                      name="date"
                      className="col-span-2"
                      value={parseDate(salaryDate.toFormat('yyyy-MM-dd'))}
                      onChange={value => update(value, 'date')}>
                      <Label>Дата смены</Label>
                      <DateField.Group fullWidth variant="secondary">
                        <DateField.Input>
                          {segment => <DateField.Segment segment={segment} />}
                        </DateField.Input>
                        <DateField.Suffix>
                          <DatePicker.Trigger>
                            <DatePicker.TriggerIndicator />
                          </DatePicker.Trigger>
                        </DateField.Suffix>
                      </DateField.Group>
                      <DatePicker.Popover>
                        <Calendar aria-label="Дата">
                          <Calendar.Header>
                            <Calendar.YearPickerTrigger>
                              <Calendar.YearPickerTriggerHeading />
                              <Calendar.YearPickerTriggerIndicator />
                            </Calendar.YearPickerTrigger>
                            <Calendar.NavButton slot="previous" />
                            <Calendar.NavButton slot="next" />
                          </Calendar.Header>
                          <Calendar.Grid>
                            <Calendar.GridHeader>
                              {day => (
                                <Calendar.HeaderCell>{day}</Calendar.HeaderCell>
                              )}
                            </Calendar.GridHeader>
                            <Calendar.GridBody>
                              {date => <Calendar.Cell date={date} />}
                            </Calendar.GridBody>
                          </Calendar.Grid>
                          <Calendar.YearPickerGrid>
                            <Calendar.YearPickerGridBody>
                              {({year}) => (
                                <Calendar.YearPickerCell year={year} />
                              )}
                            </Calendar.YearPickerGridBody>
                          </Calendar.YearPickerGrid>
                        </Calendar>
                      </DatePicker.Popover>
                    </DatePicker>
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
              </Drawer.Body>
              <Drawer.Footer>
                <Button className="w-full" variant="danger-soft" slot="close">
                  Закрыть
                </Button>
              </Drawer.Footer>
            </Drawer.Dialog>
          </Drawer.Content>
        </Drawer.Backdrop>
      </Drawer>
    </>
  )
}
