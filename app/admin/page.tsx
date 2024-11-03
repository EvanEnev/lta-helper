'use client'
import DayButton from '@/src/components/schedule/DayButton'
import telegramState from '@/src/state/telegramState'
import locations from '@/src/utils/locations'
import {Autocomplete, AutocompleteItem, Button, Input} from '@nextui-org/react'
import {useEffect, useMemo, useState} from 'react'
import {useRecoilValue} from 'recoil'

export default function Admin() {
  const telegram = useRecoilValue(telegramState)
  const [workers, setWorkers] = useState([])
  const [selectedWorker, setSelectedWorker] = useState<any>()
  const [time, setTime] = useState<string>()
  const [bonuses, setBonuses] = useState<string>()
  const [comment, setComment] = useState<string>()
  const [date, setDate] = useState<string>()
  const [error, setError] = useState<string>()
  const [location, setLocation] = useState<string | null | undefined>()

  useEffect(() => {
    const getWorkersData = async () => {
      const response = await fetch('/api/getWorkers', {
        method: 'POST',
        body: JSON.stringify({initData: telegram.initData}),
      })

      const data = await response.json()

      if (data?.workers?.length) {
        setWorkers(data.workers)
      }
    }

    getWorkersData()
  }, [telegram.initData])

  const days = useMemo(() => {
    const currentDate = new Date()
    const previousDate = new Date()

    previousDate.setDate(currentDate.getDate() - 1)

    const dates = {
      current: currentDate.toLocaleString('ru-RU', {
        day: 'numeric',
        month: 'numeric',
      }),
      prevoius: previousDate.toLocaleString('ru-RU', {
        day: 'numeric',
        month: 'numeric',
      }),
    }

    return dates
  }, [])

  const sendData = async () => {
    if (!date) {
      return setError('date')
    }

    if (!selectedWorker) {
      return setError('worker')
    }

    if (!location) {
      return setError('location')
    }

    if (!time) {
      return setError('time')
    }

    const data = {
      initData: telegram.initData,
      workerName: selectedWorker,
      time,
      bonuses,
      comment,
      date,
    }

    const result = await fetch('/api/sendWorkDays', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  useEffect(() => {
    if (selectedWorker || time || date) {
      setError('')
    }
  }, [selectedWorker, time, date])

  return (
    <main className="flex min-h-screen flex-col items-center justify-start p-4 gap-4">
      <div className="flex gap-4">
        <DayButton
          onclick={() => setDate(days.prevoius)}
          color={error === 'date' ? 'danger' : 'warning'}
          day={{date: days.prevoius}}
          isSelected={date === days.prevoius}
        />
        <DayButton
          onclick={() => setDate(days.current)}
          color={error === 'date' ? 'danger' : 'success'}
          day={{date: days.current}}
          isSelected={date === days.current}
        />
      </div>
      <Autocomplete
        isRequired
        label="Сотрудник"
        color={error === 'worker' ? 'danger' : 'default'}
        value={selectedWorker?.name}
        onSelectionChange={setSelectedWorker}>
        {workers.map((worker: any) => (
          <AutocompleteItem key={worker.name}>{worker.name}</AutocompleteItem>
        ))}
      </Autocomplete>
      <Autocomplete
        isRequired
        label="Локация"
        color={error === 'location' ? 'danger' : 'default'}
        value={location}
        onSelectionChange={setLocation}>
        {locations.map((location: string) => (
          <AutocompleteItem key={location}>{location}</AutocompleteItem>
        ))}
      </Autocomplete>
      <Input
        isRequired
        color={error === 'time' ? 'danger' : 'default'}
        label="Время работы"
        value={time}
        onValueChange={setTime}
      />
      <Input label="Бонусы/штрфы" value={bonuses} onValueChange={setBonuses} />
      <Input label="Комментарий" value={comment} onValueChange={setComment} />
      <Button size="lg" color="primary" className="w-full" onClick={sendData}>
        Отправить
      </Button>
    </main>
  )
}
