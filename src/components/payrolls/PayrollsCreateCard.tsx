import {
    Button,
    CalendarDate,
    DateRangePicker, Input, NumberInput,
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
import {Fragment, useMemo} from 'react'
import {parseDate} from '@internationalized/date'
import {LTLocation} from "@/src/utils/types";
import Location from "@/src/components/global/Location";

interface PayrollsCreateCardProps {
    locations: LTLocation[]
}

const blacklistedLocations = ['другое', 'выезд', 'отдел продаж']

export default function PayrollCreateCard({locations}: PayrollsCreateCardProps) {
  const {isOpen, onOpen, onOpenChange} = useDisclosure()

  const currentDate = useMemo(() => DateTime.now().setZone('Europe/Moscow'), [])

  const initialState: {start?: CalendarDate; end?: CalendarDate} = {
    start: undefined,
    end: undefined,
  }

  if (currentDate.day > 20 || currentDate.day < 5) {
    const monthNumber =
      currentDate.day < 5 ? currentDate.month - 1 : currentDate.month

    initialState.start = parseDate(
      currentDate
        .set({
          day: 15,
          month: monthNumber,
        })
        .toFormat('yyyy-MM-dd'),
    )

    initialState.end = parseDate(
      currentDate
        .set({
          day: currentDate.set({month: monthNumber}).daysInMonth,
          month: monthNumber,
        })
        .toFormat('yyyy-MM-dd'),
    )
  } else {
    const monthNumber = currentDate.day

    initialState.start = parseDate(
      currentDate
        .set({
          day: 1,
          month: monthNumber,
        })
        .toFormat('yyyy-MM-dd'),
    )

    initialState.end = parseDate(
      currentDate
        .set({
          day: currentDate.set({month: monthNumber}).daysInMonth,
          month: monthNumber,
        })
        .toFormat('yyyy-MM-dd'),
    )
  }

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
      <Modal isOpen={isOpen} onOpenChange={onOpenChange} className="overflow-auto">
        <ModalContent>
          {onClose => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                Создание ведомости
              </ModalHeader>
              <ModalBody>
                <DateRangePicker
                  defaultValue={{start: initialState.start!, end: initialState.end!}}
                  label="Диапазон дат"
                  labelPlacement="outside"
                />
                  <div className='grid grid-cols-2 gap-2 auto-rows-auto grid-flow-row max-h-[50%]'>
                      {filteredLocations.map((location) => {
                          return <Fragment key={location.id}>
                              <Location locationName={location.name} />
                              <NumberInput endContent={<Ruble />} defaultValue={0} minValue={0} />
                          </Fragment>
                      })}
                  </div>
              </ModalBody>
              <ModalFooter>
                <Button color="danger" variant="light" onPress={onClose}>
                    Закрыть
                </Button>
                <Button color="primary" onPress={onClose}>
                  Продолжить
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </>
  )
}
