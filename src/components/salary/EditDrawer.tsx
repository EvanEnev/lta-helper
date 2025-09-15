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
  Input,
  NumberInput,
  Textarea,
  TimeInput,
  useDisclosure,
} from '@heroui/react'
import {
  BillCheck,
  BillCross,
  ChatRoundLine,
  ClockCircle,
  History,
  Pen2,
  Ruble,
} from 'solar-icon-set'
import {SalaryData} from '@/src/utils/types'
import Location from '@/src/components/global/Location'
import {DateTime} from 'luxon'
import {useCallback, useMemo} from 'react'
import {parseDate} from '@internationalized/date'
import DeleteButton from '@/src/components/salary/DeleteButton'
import useIsMobile from '@/src/hooks/useIsMobile'
import LocationSelect from '@/src/components/global/LocationSelect'

interface EditDrawerProps {
  data: SalaryData
  handleEdit: any
  handleDelete: any
}

export default function EditDrawer({
  data,
  handleEdit,
  handleDelete,
}: EditDrawerProps) {
  const {isOpen, onOpen, onOpenChange} = useDisclosure()
  const isMobile = useIsMobile()

  const time = useMemo(() => {
    const startTime = data.start_time.slice(0, -3)
    const endTime = data.end_time.slice(0, -3)

    return {
      start: {
        hour: startTime.split(':')[0],
        minute: startTime.split(':')[1],
      },
      end: {
        hour: endTime.split(':')[0],
        minute: endTime.split(':')[1],
      },
    }
  }, [data.start_time, data.end_time])

  const overWorkTime = useMemo(() => {
    if (!(data.overwork_start && data.overwork_end)) {
      return {}
    }

    const startTime =
      data.overwork_start === '--' ? '--' : data.overwork_start.slice(0, -3)
    const endTime =
      data.overwork_end === '--' ? '--' : data.overwork_end.slice(0, -3)

    return {
      start: {
        hour: startTime.split(':')[0],
        minute: startTime.split(':')[1],
      },
      end: {
        hour: endTime.split(':')[0],
        minute: endTime.split(':')[1],
      },
    }
  }, [data.overwork_start, data.overwork_end])

  const salaryDate = useMemo(() => DateTime.fromISO(data.date), [data.date])

  const update = useCallback(
    (
      value:
        | string
        | {
            hour: number
            minute: number
          }
        | DateValue
        | null,
      type:
        | 'delete'
        | 'newLocation'
        | 'newDate'
        | 'start_time'
        | 'end_time'
        | 'value'
        | 'bonuses'
        | 'fines'
        | 'overwork_start'
        | 'overwork_end'
        | 'overwork'
        | 'comment',
    ) => {
      const newData: SalaryData = {...data}

      if (type === 'delete') {
        return handleDelete(newData)
      }

      if (
        ['start_time', 'end_time', 'overwork_start', 'overwork_end'].includes(
          type,
        )
      ) {
        value = value as {hour: number; minute: number}

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

      if (type === 'newDate') {
        const newValue = value as DateValue | null
        if (!(newValue?.day && newValue?.year && newValue?.month)) {
          return
        }

        const newDate = DateTime.now()
          .setZone('Europe/Moscow')
          .set({day: newValue.day, month: newValue.month, year: newValue.year})

        value = newDate.toFormat('yyyy-MM-dd')
      }

      // @ts-ignore
      newData[type] = value

      handleEdit(newData)
    },
    [data, handleDelete, handleEdit],
  )

  return (
    <>
      <Button
        startContent={<Pen2 />}
        variant="faded"
        className="w-full"
        onPress={() => onOpen()}>
        Изменить
      </Button>
      <Drawer
        placement={isMobile ? 'bottom' : 'right'}
        isOpen={isOpen}
        classNames={{wrapper: 'z-10000', backdrop: 'z-10000'}}
        className="min-h-[80%]"
        onOpenChange={onOpenChange}>
        <DrawerContent>
          {onClose => (
            <>
              <DrawerHeader className="flex flex-col gap-2">
                <div className="flex items-center gap-2">
                  <Location locationName={data.location.name || ''} />
                  <p>{DateTime.fromISO(data.date).toFormat('dd.MM yyyy')}</p>
                </div>
                <p className="text-foreground-400 text-s">
                  Проставлена: {data.created_by}{' '}
                  {DateTime.fromISO(data.created_at).toFormat('dd.MM yyyy')}
                </p>
              </DrawerHeader>
              <DrawerBody className="grid grid-flow-row auto-rows-min grid-cols-2 gap-2">
                <div className="col-span-full flex items-center gap-1">
                  <ClockCircle size={22} />
                  <p>Смена</p>
                </div>
                <TimeInput
                  label="Начало"
                  // @ts-ignore
                  value={time.start}
                  // @ts-ignore
                  onChange={value => update(value, 'start_time')}
                />
                <TimeInput
                  label="Конец"
                  // @ts-ignore
                  value={time.end}
                  // @ts-ignore
                  onChange={value => update(value, 'end_time')}
                />
                <NumberInput
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
                {/*// @ts-ignore*/}
                <TimeInput
                  label="Начало"
                  // @ts-ignore
                  value={overWorkTime.start}
                  // @ts-ignore
                  onChange={value => update(value, 'overwork_start')}
                />
                {/*// @ts-ignore*/}
                <TimeInput
                  label="Конец"
                  // @ts-ignore
                  value={overWorkTime.end}
                  // @ts-ignore
                  onChange={value => update(value, 'overwork_end')}
                />
                <NumberInput
                  label="Сумма"
                  className="text-foreground col-span-2 w-full justify-self-end text-end text-xs"
                  value={data.overwork ? Number(data.overwork) : 0}
                  minValue={0}
                  onValueChange={value => update(value.toString(), 'overwork')}
                  endContent={<Ruble iconStyle="Bold" />}
                />
                <Divider className="col-span-full" />
                <div className="col-span-full flex items-center gap-1">
                  <BillCheck iconStyle="Bold" size={22} />
                  <p>Бонусы</p>
                </div>
                <Input
                  aria-label="Бонусы"
                  className="col-span-full w-full justify-self-end text-end"
                  onValueChange={value => update(value, 'bonuses')}
                  value={data.bonuses || ''}
                />
                <div className="col-span-full flex items-center gap-1">
                  <BillCross iconStyle="Bold" size={22} />
                  <p>Штрафы</p>
                </div>
                <Input
                  aria-label="Штрафы"
                  className="col-span-full w-full justify-self-end text-end"
                  onValueChange={value => update(value, 'fines')}
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
                <Divider className="col-span-full" />
                <DatePicker
                  label="Дата смены"
                  className="col-span-2"
                  onChange={value => update(value, 'newDate')}
                  // @ts-ignore
                  value={parseDate(salaryDate.toFormat('yyyy-MM-dd'))}
                />
                <DeleteButton
                  callback={() => update('', 'delete')}
                  className="col-span-2 h-full w-full"
                />
                <div className="col-span-2">
                  <LocationSelect
                    labelPlacement="inside"
                    callback={(location: any) =>
                      update(location, 'newLocation')
                    }
                    locationId={data.location.id}
                  />
                </div>
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
