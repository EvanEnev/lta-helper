'use client'

import {Activity, Dispatch, SetStateAction, useCallback, useState} from 'react'
import {
  Button,
  ComboBox,
  Input,
  Label,
  ListBox,
  NumberField,
  Select,
  Separator,
  TextField,
} from '@heroui/react-beta'
import {Pen2, Ruble} from 'solar-icon-set'
import {LTPayment, LTPaymentType, LTWorker} from '@/src/utils/types'
import {CalendarDate, DatePicker} from '@heroui/react'
import {parseDate} from '@internationalized/date'
import {Icon} from '@iconify/react'

interface PaymentCardProps {
  paymentsTypes: LTPaymentType[]
  payment: LTPayment
  setPayments: Dispatch<SetStateAction<LTPayment[]>>
  updateData: (payment: LTPayment) => Promise<void>
  workers: LTWorker['name'][]
  canEdit: boolean
}

export default function PaymentsRow({
  paymentsTypes,
  payment: paymentData,
  setPayments,
  updateData,
  workers,
  canEdit,
}: PaymentCardProps) {
  const [payment, setPayment] = useState<LTPayment>(paymentData)
  const [editMode, setEditMode] = useState(!!payment.editMode)

  const parseDatePicker = useCallback((value: CalendarDate | null): string => {
    if (!value) return ''
    return `${value.year}-${value.month >= 10 ? value.month : `0${value.month}`}-${value.day >= 10 ? value.day : `0${value.day}`}`
  }, [])

  return (
    <div className="bg-content1 flex w-full items-center gap-2 rounded-xl p-2">
      <DatePicker
        onChange={v =>
          // @ts-ignore
          setPayment(prev => ({...prev, date: parseDatePicker(v)}))
        }
        label="Дата"
        labelPlacement="outside"
        className="w-fit"
        isReadOnly={!editMode}
        // @ts-ignore
        value={parseDate(payment.date)}
      />
      <div className="flex flex-col gap-1">
        <Label>Позывной</Label>
        {editMode && !payment.worker?.name ? (
          <ComboBox
            onSelectionChange={v =>
              // @ts-ignore
              setPayment(prev => ({
                ...prev,
                worker: {id: prev.worker?.id, name: String(v || '')},
              }))
            }
            selectedKey={payment.type}>
            <ComboBox.InputGroup className="w-50">
              <Input placeholder="Выберите элемент" />
              <ComboBox.Trigger />
            </ComboBox.InputGroup>
            <ComboBox.Popover>
              <ListBox>
                {workers.map(worker => (
                  <ListBox.Item id={worker} key={worker} textValue={worker}>
                    {worker}
                  </ListBox.Item>
                ))}
              </ListBox>
            </ComboBox.Popover>
          </ComboBox>
        ) : (
          <div className="bg-content2 flex h-10 flex-col gap-2 rounded-xl p-2 px-4">
            {payment.worker?.name}
          </div>
        )}
      </div>
      {editMode ? (
        <Select
          value={payment.type}
          onChange={v => setPayment(prev => ({...prev, type: String(v || '')}))}
          selectionMode="single">
          <Label>Тип</Label>
          <Select.Trigger className="w-50">
            <Select.Value />
            <Select.Indicator />
          </Select.Trigger>
          <Select.Popover>
            <ListBox>
              {paymentsTypes.map(type => (
                <ListBox.Item
                  id={type.name}
                  key={type.name}
                  textValue={type.name}>
                  {type.name}
                </ListBox.Item>
              ))}
            </ListBox>
          </Select.Popover>
        </Select>
      ) : (
        <div className="flex w-50 flex-col">
          <p>Тип</p>
          <div className="bg-content2 h-10 rounded-xl p-2">
            <p>{payment.type}</p>
          </div>
        </div>
      )}
      <NumberField
        variant="secondary"
        isReadOnly={!editMode}
        value={payment.value}
        onChange={v => setPayment(prev => ({...prev, value: v}))}
        className="h-full">
        <Label className="mt-auto">Сумма</Label>
        <NumberField.Group className="h-10">
          <NumberField.Input className="h-10" placeholder="0" />
          <Ruble
            iconStyle="Bold"
            className={`mr-3 ${editMode ? '' : 'opacity-30'} transition-opacity duration-250`}
          />
        </NumberField.Group>
      </NumberField>
      <TextField
        variant="secondary"
        value={payment.comment || ''}
        onChange={v => setPayment(prev => ({...prev, comment: v}))}
        isReadOnly={!editMode}>
        <Label>Комментарий</Label>
        <Input placeholder="Пусто.."></Input>
      </TextField>
      <Activity mode={canEdit ? 'visible' : 'hidden'}>
        {editMode ? (
          <>
            <Button
              variant="primary"
              onPress={async () => {
                await updateData(payment)
                setPayment(prev => ({...prev, create: false}))
                setEditMode(false)
              }}>
              <Icon icon="solar:check-circle-outline" className="w-6" />
              Сохранить
            </Button>
            <Separator orientation="vertical" className="bg-content3" />
            <Button
              variant="danger"
              onPress={() => {
                if (!payment.worker?.name) {
                  setPayments(prev => prev.filter(p => p.id !== payment.id))
                }

                setPayment(paymentData)
                setEditMode(false)
              }}>
              <Icon icon="solar:close-circle-outline" className="w-6" />
              Отменить
            </Button>
            {!payment.create && (
              <>
                <Separator orientation="vertical" className="bg-content3" />
                <Button
                  variant="danger-soft"
                  size="lg"
                  className="flex items-center gap-2"
                  onPress={async () => {
                    setPayments(prev => prev.filter(p => p.id !== payment.id))
                    await updateData({...payment, delete: true})
                  }}>
                  <Icon
                    icon="solar:trash-bin-minimalistic-outline"
                    className="w-6"
                  />
                  Удалить
                </Button>
              </>
            )}
          </>
        ) : (
          <Button
            size="lg"
            variant="tertiary"
            onPress={() => setEditMode(true)}>
            <Pen2 size={24} /> Изменить
          </Button>
        )}
      </Activity>
    </div>
  )
}
