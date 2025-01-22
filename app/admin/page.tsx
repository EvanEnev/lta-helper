'use client'
import convertTZ from '@/lib/convertTZ'
import WorkData from '@/src/components/admin/WorkData'
import DayButton from '@/src/components/schedule/DayButton'
import telegramState from '@/src/state/telegramState'
import workerState from '@/src/state/workerState'
import {WorkerSalary} from '@/src/utils/types'
import {
  Accordion,
  AccordionItem,
  Alert,
  AlertVariantProps,
  Button,
  Selection,
} from '@nextui-org/react'
import {useEffect, useMemo, useState} from 'react'
import {useRecoilValue} from 'recoil'

type AlertData = {
  color: AlertVariantProps['color']
  message: string
  title: string
}

export default function Admin() {
  const telegram = useRecoilValue(telegramState)
  const [salaryData, setSalaryData] = useState<WorkerSalary[]>([
    {
      worker: '',
      workingHours: '',
      location: '',
      bonuses: '',
      comment: '',
      isHardTime: false,
      gamesCount: 1,
    },
  ])
  const [workers, setWorkers] = useState([])
  const worker = useRecoilValue(workerState)
  const [date, setDate] = useState<string>()
  const [isLoading, setLoading] = useState<boolean>(false)
  const [alertData, setAlertData] = useState<AlertData>()
  const [key, setKey] = useState(0)
  const [selectedKeys, setSelectedKeys] = useState<Selection>(new Set(['0']))

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
    const currentDate = convertTZ(new Date(), 'Europe/Moscow')
    const previousDate = convertTZ(new Date(), 'Europe/Moscow')

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
      today: currentDate,
    }

    return dates
  }, [])

  useEffect(() => {
    setDate(days.current)
  }, [days])

  const sendData = async () => {
    if (!salaryData.length)
      return setAlertData({
        title: 'Ошибка',
        message: 'Нет данных для отправки',
        color: 'danger',
      })

    const data = {
      initData: telegram.initData,
      salaryData,
      date,
      worker,
    }

    setLoading(true)

    fetch('/api/sendWorkDays', {
      method: 'POST',
      body: JSON.stringify(data),
    }).then(data => {
      setLoading(false)
      data.json().then(jsonData => {
        if (data.status === 200) {
          setAlertData({
            title: 'Успешно',
            message: jsonData.message || 'Данные отправлены',
            color: 'success',
          })
        } else {
          if (jsonData.message) {
            setAlertData({
              title: 'Ошибка',
              message: jsonData.message,
              color: 'danger',
            })
          } else {
            setAlertData({
              title: 'Ошибка',
              message: 'Неизвестно, что произошло...',
              color: 'danger',
            })
          }
        }
      })
    })
  }

  const addSalaryData = () => {
    setSalaryData(prev => [
      ...prev,
      {
        worker: '',
        workingHours: '',
        location: '',
        bonuses: '',
        comment: '',
        isHardTime: false,
        gamesCount: 1,
      },
    ])

    setKey(key + 1)
    setSelectedKeys(new Set([salaryData.length.toString()]))
  }

  const removeSalaryData = (index: number) => {
    setSalaryData(prev => prev.filter((_, i) => i !== index))
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-start p-4 gap-4">
      <Alert
        color={alertData?.color}
        isVisible={!!alertData?.message}
        description={alertData?.message}
        title={alertData?.title}
        onClose={() => setAlertData({title: '', message: '', color: 'danger'})}
        variant="solid"
        classNames={{
          base: 'sticky z-10 top-4 w-[90%]',
        }}
      />
      <div className="flex gap-4">
        <DayButton
          onclick={() => setDate(days.prevoius)}
          day={{date: days.prevoius}}
          color="warning"
          isSelected={date === days.prevoius}
          disabled={days.today.getHours() > 3}
        />
        <DayButton
          onclick={() => setDate(days.current)}
          day={{date: days.current}}
          color="success"
          isSelected={date === days.current}
        />
      </div>

      <Accordion
        variant="splitted"
        className="p-0"
        key={key}
        selectedKeys={selectedKeys}
        onSelectionChange={setSelectedKeys}>
        {salaryData?.map((data, index) => {
          const title = `${index + 1}. ${
            [data.worker, data.location, data.workingHours]
              .filter(v => !!v)
              .join(', ') || 'Не заполнено'
          }`

          return (
            <AccordionItem
              title={title}
              key={index}
              className="pb-2"
              startContent={
                <Button
                  isIconOnly
                  color="danger"
                  variant="ghost"
                  onPress={() => removeSalaryData(index)}>
                  X
                </Button>
              }>
              <WorkData
                data={data}
                setData={setSalaryData}
                workers={workers}
                index={index}
              />
            </AccordionItem>
          )
        })}
      </Accordion>

      <Button
        size="lg"
        color="default"
        className="w-full h-16"
        onPress={addSalaryData}>
        Добавить
      </Button>
      <Button
        size="lg"
        color="primary"
        className="w-full h-16"
        onPress={sendData}
        isLoading={isLoading}>
        Отправить
      </Button>
    </main>
  )
}
