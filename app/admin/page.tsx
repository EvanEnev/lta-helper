'use client'
import WorkData from '@/src/components/admin/WorkData'
import DayButton from '@/src/components/schedule/DayButton'
import telegramState from '@/src/state/telegramState'
import workerState from '@/src/state/workerState'
import { WorkerSalary } from '@/src/utils/types'
import {Accordion, AccordionItem, Autocomplete, AutocompleteItem, Button, Input, Selection} from '@nextui-org/react'
import {useEffect, useMemo, useState} from 'react'
import {useRecoilValue} from 'recoil'

export default function Admin() {
  const telegram = useRecoilValue(telegramState)
  const [salaryData, setSalaryData] = useState<WorkerSalary[]>([{worker: '', workingHours: '', location: '', bonuses: '', comment: '', isHardTime: false, gamesCount: 1}])
  const [workers, setWorkers] = useState([])
  const worker = useRecoilValue(workerState)
  const [date, setDate] = useState<string>()
  const [isLoading, setLoading] = useState<boolean>(false)
  
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

  useEffect(()=> {
    setDate(days.current)
  }, [])

  const sendData = async () => {
    const data = {
      initData: telegram.initData,
      salaryData,
      date,
      worker
    }

    setLoading(true)

    fetch('/api/sendWorkDays', {
      method: 'POST',
      body: JSON.stringify(data),
    }).then(() => {
      setLoading(false)
    })
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-start p-4 gap-4">
            <div className="flex gap-4">
        <DayButton
          onclick={() => setDate(days.prevoius)}
          day={{date: days.prevoius}}
          color='warning'
          isSelected={date === days.prevoius}
        />
        <DayButton
          onclick={() => setDate(days.current)}
          day={{date: days.current}}
          color='success'
          isSelected={date === days.current}
        />
      </div>

      <Accordion variant="splitted" className='p-0'>
        {salaryData?.map((data, index) =>
        <AccordionItem title={`${index + 1}. ${data.worker} ${data.location} ${data.workingHours}`} key={index}>
          <WorkData data={data} setData={setSalaryData} workers={workers} index={index}/>
          </AccordionItem>)}
      </Accordion>

      <Button size='lg' color='default' className='w-full h-16' onClick={() => 
        setSalaryData(prev => [...prev, {worker: '', workingHours: '', location: '', bonuses: '', comment: '', isHardTime: false, gamesCount: 1}])
        }>Добавить</Button>
      <Button size="lg" color="primary" className="w-full h-16" onClick={sendData} isLoading={isLoading}>
        Отправить
      </Button>
    </main>
  )
}
