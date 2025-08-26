import {
  Button,
  CalendarDate,
  DateRangePicker,
  useDisclosure,
} from '@heroui/react'
import {AddCircle} from 'solar-icon-set'
import {
  Modal,
  ModalContent,
  ModalBody,
  ModalFooter,
  ModalHeader,
} from '@heroui/modal'
import {DateTime} from 'luxon'
import {useMemo} from 'react'
import {parseDate} from '@internationalized/date'

export default function PayrollCreateCard() {
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

  return (
    <>
      <Button
        variant="ghost"
        onPress={onOpen}
        className="flex h-[18rem] w-[20rem] flex-col gap-2 border-dashed text-2xl">
        <AddCircle size={50} />
        Создать
      </Button>
      <Modal isOpen={isOpen} onOpenChange={onOpenChange}>
        <ModalContent>
          {onClose => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                Создание ведомости
              </ModalHeader>
              <ModalBody>
                <DateRangePicker
                  defaultValue={initialState}
                  label="Диапазон дат"
                  labelPlacement="outside"
                />
              </ModalBody>
              <ModalFooter>
                <Button color="danger" variant="light" onPress={onClose}>
                  Close
                </Button>
                <Button color="primary" onPress={onClose}>
                  Action
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </>
  )
}
