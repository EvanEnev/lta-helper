import {
    Button,
    CalendarDate, Checkbox,
    DateRangePicker, Divider, NumberInput, RangeValue,
    useDisclosure,
} from '@heroui/react'
import {AddCircle, Ruble} from 'solar-icon-set'
import {
  Modal,
  ModalContent,
  ModalBody,
  ModalFooter,
  ModalHeader,
} from '@heroui/modal'
import {DateTime} from 'luxon'
import {Fragment, useCallback, useEffect, useMemo, useState} from 'react'
import {parseDate} from '@internationalized/date'
import {LTLocation} from "@/src/utils/types";
import Location from "@/src/components/global/Location";
import Link from "next/link";

interface PayrollsCreateCardProps {
    locations: LTLocation[]
}

const blacklistedLocations = ['другое', 'выезд', 'отдел продаж']

export default function PayrollCreateCard({locations}: PayrollsCreateCardProps) {
  const {isOpen, onOpen, onOpenChange} = useDisclosure()
    const [moneyOnLocations, setMoneyOnLocations] = useState<{location: LTLocation['id'], value: number}[]>(locations.map((l) => ({location: l.id, value: 0})))
    const [dateRange, setDateRange] = useState<RangeValue<CalendarDate> | null>(null)
  const currentDate = useMemo(() => DateTime.now().setZone('Europe/Moscow'), [])

    const [bonuses, setBonuses] = useState<boolean>(false)

  useEffect(() => {
      if (currentDate.day > 20 || currentDate.day < 5) {
          const monthNumber =
              currentDate.day < 5 ? currentDate.month - 1 : currentDate.month

          const start = parseDate(
              currentDate
                  .set({
                      day: 15,
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

          setDateRange({start, end })
      } else {
          const monthNumber = currentDate.day

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
                      day: currentDate.set({month: monthNumber}).daysInMonth,
                      month: monthNumber,
                  })
                  .toFormat('yyyy-MM-dd'),
          )

          setDateRange({start, end })
            setBonuses(true)
      }
  }, [])


  const filteredLocations = useMemo(() =>
      locations.filter(l => !blacklistedLocations.includes(l.name.toLowerCase())
      ), [locations])

  return (
    <>
      <Button
        variant="ghost"
        onPress={onOpen}
        className="flex h-[18rem] w-[20rem] flex-col gap-2 border-dashed text-2xl">
        <AddCircle size={50} />
        Создать
      </Button>
      <Modal isOpen={isOpen} onOpenChange={onOpenChange} className="h-[80%] min-w-[50%]">
        <ModalContent>
          {onClose => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                Создание ведомости
              </ModalHeader>
              <ModalBody className='h-[50%]'>
                  <p className='w-full bg-content3 z-100 p-2 rounded-xl'>Диапазон дат</p>

                  <DateRangePicker
                      value={dateRange}
                  onChange={(value) => setDateRange(value)}
                  aria-label="Диапазон дат"
                  labelPlacement="outside"
                />
                  <Divider />
                  <Checkbox onValueChange={setBonuses} isSelected={bonuses}>Бонусы</Checkbox>
                  <Divider />
                  <div className='grid grid-cols-2 gap-2 auto-rows-auto grid-flow-row overflow-auto'>
                      <p className='col-span-full sticky top-0 w-full bg-content3 z-100 p-2 rounded-xl'>Зарплатные деньги на локациях</p>
                      {filteredLocations.map((location) => {
                          return <Fragment key={location.id}>
                              <Location locationName={location.name} />
                              <NumberInput onValueChange={(value) => setMoneyOnLocations(prev => prev.map(d => d.location === location.id ? {location: location.id, value} : d))} endContent={<Ruble />} defaultValue={0} minValue={0} value={moneyOnLocations.find(d => d.location === location.id)?.value} />
                          </Fragment>
                      })}
                  </div>
              </ModalBody>
              <ModalFooter>
                <Button color="danger" variant="light" onPress={onClose}>
                    Закрыть
                </Button>
                <Button color="primary">
                    <Link href={{pathname: '/payrolls/create', query: {dates: JSON.stringify({start: dateRange?.start.toString(), end: dateRange?.end.toString()}), moneyOnLocations: JSON.stringify(moneyOnLocations), bonuses}}}>Продолжить</Link>
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </>
  )
}
