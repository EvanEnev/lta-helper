'use client'

import convertTZ from '@/lib/convertTZ'
import DesktopAdmin from '@/src/components/admin/DesktopAdmin'
import MobileAdmin from '@/src/components/admin/MobileAdmin'
import useIsMobile from '@/src/hooks/useIsMobile'
import alertState from '@/src/state/alertState'
import telegramState from '@/src/state/telegramState'
import workerState from '@/src/state/workerState'
import {WorkerSalary} from '@/src/utils/types'
import {useEffect, useMemo, useState} from 'react'
import {useRecoilState, useRecoilValue} from 'recoil'

export default function Admin() {
  const isMobile = useIsMobile()
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
  const [_, setAlertData] = useRecoilState(alertState)

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
      previous: previousDate.toLocaleString('ru-RU', {
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

  return isMobile ? (
    <MobileAdmin
      {...{
        sendData,
        workers,
        days,
        date,
        setDate,
        setSalaryData,
        salaryData,
        isLoading,
      }}
    />
  ) : (
    <DesktopAdmin
      {...{
        sendData,
        workers,
        days,
        date,
        setDate,
        setSalaryData,
        salaryData,
        isLoading,
      }}
    />
  )
}
