import {
  Form,
  Label,
  Input,
  TextField,
  FieldError,
  Autocomplete,
  Button,
  SearchField,
  ListBox,
} from '@heroui/react'
import {Activity, FormEvent} from 'react'
import {LTWorker} from '@/src/utils/types'
import {withMask} from 'use-mask-input'

interface Step2Props {
  worker?: LTWorker
  handler: (e: FormEvent<HTMLFormElement>) => void
  workers: {id: number; name: string}[]
}
export default function Step2({worker, handler, workers}: Step2Props) {
  return (
    <Form className="flex w-full flex-col gap-2" onSubmit={handler}>
      <TextField isRequired defaultValue={worker?.name}>
        <Label>Позывной</Label>
        <Input name="name" />
        <FieldError>Поле обязательно</FieldError>
      </TextField>
      <TextField isRequired defaultValue={worker?.lastName || undefined}>
        <Label>Фамилия</Label>
        <Input name="last_name" />
        <FieldError>Поле обязательно</FieldError>
      </TextField>
      <TextField isRequired defaultValue={worker?.firstName || undefined}>
        <Label>Имя</Label>
        <Input name="first_name" />
        <FieldError>Поле обязательно</FieldError>
      </TextField>
      <TextField isRequired defaultValue={worker?.middleName || undefined}>
        <Label>Отчество</Label>
        <Input name="middle_name" />
      </TextField>
      <TextField
        type="tel"
        isRequired
        defaultValue={worker?.phoneNumber || undefined}>
        <Label>Номер телефона</Label>
        <Input
          placeholder="+7 ___ ___-__-__"
          ref={withMask('+7 999 999-99-99', {
            inputmode: 'numeric',
            placeholder: '_',
          })}
          name="phone"
        />
        <FieldError>Поле обязательно</FieldError>
      </TextField>
      <TextField
        type="email"
        isRequired
        defaultValue={worker?.email || undefined}>
        <Label>Google почта</Label>
        <Input name="email" />
        <FieldError>Неверная почта</FieldError>
      </TextField>
      <Activity mode={worker?.isApproved || worker?.id ? 'hidden' : 'visible'}>
        <Autocomplete name="invited_by" isRequired>
          <Label>Куратор при обучении</Label>
          <Autocomplete.Trigger>
            <Autocomplete.Value />
            <Autocomplete.ClearButton />
            <Autocomplete.Indicator />
          </Autocomplete.Trigger>
          <Autocomplete.Popover>
            <Autocomplete.Filter>
              <SearchField>
                <SearchField.Group>
                  <SearchField.SearchIcon />
                  <SearchField.Input />
                </SearchField.Group>
              </SearchField>
              <ListBox>
                {workers.map(({id, name}) => (
                  <ListBox.Item textValue={name} id={id} key={id}>
                    <Label>{name}</Label>
                    <ListBox.ItemIndicator />
                  </ListBox.Item>
                ))}
              </ListBox>
            </Autocomplete.Filter>
          </Autocomplete.Popover>
          <FieldError>Поле обязательно</FieldError>
        </Autocomplete>
      </Activity>

      <Button
        className="mt-8 h-16 w-full"
        variant="primary"
        size="lg"
        type="submit">
        Продолжить
      </Button>
    </Form>
  )
}
