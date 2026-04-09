'use client'

import {
  Button,
  FieldError,
  Form,
  Input,
  Label,
  TextField,
  toast,
} from '@heroui/react'
import {FormEvent} from 'react'
import {useRouter} from 'next/navigation'
import {LTWorker} from '@/src/utils/types'
import {withMask} from 'use-mask-input'
import {authClient} from '@/lib/auth/authClient'
import {Icon} from '@iconify/react'

interface RegisterPageProps {
  worker: LTWorker
  workers: {id: number; name: string}[]
}

export default function RegisterPage({worker, workers}: RegisterPageProps) {
  const router = useRouter()

  const handler = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const data = Object.fromEntries(new FormData(e.currentTarget))

    const result = await fetch('/api/register', {
      method: 'POST',
      body: JSON.stringify({data: data}),
    })

    let message = ''

    try {
      const resultData = await result.json()
      if (resultData.message) {
        message = resultData.message
      }
    } catch {}

    if (result.ok) {
      toast('Успешно!', {
        description: message || 'Регистрация завершена',
        timeout: 8000,
        variant: 'success',
      })
    } else {
      toast('Ошибка!', {
        description: message || 'Неизвестная ошибка',
        variant: 'danger',
      })
    }

    if (result.ok) {
      router.push('/')
    }
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 p-4">
      <h1 className="text-5xl font-bold">Регистрация</h1>
      <div className="flex max-h-[50%] w-full flex-wrap justify-center gap-4 sm:w-1/2">
        <Button
          className="w-full"
          variant="tertiary"
          onPress={async () => {
            await authClient.signOut()

            await authClient.signIn.social({
              provider: 'google',
              callbackURL: '/',
            })
          }}>
          <Icon
            icon={`logos:google-icon`}
            className="w-fit p-1"
            width="256"
            height="262"
          />
          Войти с Google
        </Button>
        <Form className="flex w-full flex-col gap-2" onSubmit={handler}>
          <TextField isRequired defaultValue={worker.name || ''}>
            <Label>Позывной</Label>
            <Input name="name" />
            <FieldError>Поле обязательно</FieldError>
          </TextField>
          <TextField isRequired defaultValue={worker.lastName || ''}>
            <Label>Фамилия</Label>
            <Input name="last_name" />
            <FieldError>Поле обязательно</FieldError>
          </TextField>
          <TextField isRequired defaultValue={worker.firstName || ''}>
            <Label>Имя</Label>
            <Input name="first_name" />
            <FieldError>Поле обязательно</FieldError>
          </TextField>
          <TextField isRequired defaultValue={worker.middleName || ''}>
            <Label>Отчество</Label>
            <Input name="middle_name" />
          </TextField>
          <TextField
            type="tel"
            isRequired
            defaultValue={worker.phoneNumber || ''}>
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
          <TextField type="email" isRequired defaultValue={worker.email || ''}>
            <Label>Google почта</Label>
            <Input name="email" />
            <FieldError>Неверная почта</FieldError>
          </TextField>
          {/*<Activity*/}
          {/*  mode={worker.isApproved || worker.id ? 'hidden' : 'visible'}>*/}
          {/*  <Autocomplete>*/}
          {/*    <Label>Куратор при обучении</Label>*/}
          {/*    <Autocomplete.Trigger>*/}
          {/*      <Autocomplete.Value />*/}
          {/*      <Autocomplete.ClearButton />*/}
          {/*      <Autocomplete.Indicator />*/}
          {/*    </Autocomplete.Trigger>*/}
          {/*    <Autocomplete.Popover>*/}
          {/*      <Autocomplete.Filter>*/}
          {/*        <SearchField>*/}
          {/*          <SearchField.Group>*/}
          {/*            <SearchField.SearchIcon />*/}
          {/*            <SearchField.Input />*/}
          {/*          </SearchField.Group>*/}
          {/*        </SearchField>*/}
          {/*        <ListBox>*/}
          {/*          {workers.map(({id, name}) => (*/}
          {/*            <ListBox.Item key={id}>*/}
          {/*              <Label>{name}</Label>*/}
          {/*              <ListBox.ItemIndicator />*/}
          {/*            </ListBox.Item>*/}
          {/*          ))}*/}
          {/*        </ListBox>*/}
          {/*      </Autocomplete.Filter>*/}
          {/*    </Autocomplete.Popover>*/}
          {/*  </Autocomplete>*/}
          {/*</Activity>*/}

          <Button
            className="mt-8 h-16 w-full"
            variant="primary"
            size="lg"
            type="submit">
            Отправить
          </Button>
        </Form>
      </div>
    </main>
  )
}
