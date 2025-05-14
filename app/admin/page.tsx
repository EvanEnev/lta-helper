'use client'

import convertTZ from '@/lib/convertTZ'
import DesktopAdmin from '@/src/components/admin/DesktopAdmin'
import MobileAdmin from '@/src/components/admin/MobileAdmin'
import useIsMobile from '@/src/hooks/useIsMobile'
import {WorkerSalary} from '@/src/utils/types'
import {useEffect, useMemo, useState} from 'react'
import {useAtomValue, useSetAtom} from 'jotai'
import {alertAtom, telegramAtom} from '@/src/utils/global/atoms'

export default function Admin() {
  const isMobile = useIsMobile()
  const telegram = useAtomValue(telegramAtom)
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
  const [date, setDate] = useState<Date>()
  const [isLoading, setLoading] = useState<boolean>(false)
  const setAlertData = useSetAtom(alertAtom)

  useEffect(() => {
    const getWorkersData = async () => {
      const response = await fetch('/api/getWorkers')

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
      current: currentDate,
      previous: previousDate,
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
      salaryData,
      date,
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
