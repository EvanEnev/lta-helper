'use client'

import convertTZ from '@/lib/functions/convertTZ'
import DesktopAdmin from '@/src/components/admin/DesktopAdmin'
import MobileAdmin from '@/src/components/admin/MobileAdmin'
import useIsMobile from '@/src/hooks/useIsMobile'
import {LTWorker, WorkerSalary} from '@/src/utils/types'
import {useEffect, useMemo, useState} from 'react'
import {useSetAtom} from 'jotai'
import {alertAtom} from '@/src/utils/global/atoms'
import {DateTime} from 'luxon'

export default function AdminPage({
  workers = [],
  canEdit,
}: {
  workers: LTWorker[]
  canEdit: boolean
}) {
  const isMobile = useIsMobile()
  const [salaryData, setSalaryData] = useState<WorkerSalary[]>([
    {
      worker: '',
      workingHours: '',
      location: '',
      bonuses: '',
      fines: '',
      comment: '',
      isHardTime: false,
      gamesCount: 1,
      value: 0,
    },
  ])
  const [date, setDate] = useState<DateTime>(
    convertTZ(new Date(), 'Europe/Moscow'),
  )
  const [isLoading, setLoading] = useState<boolean>(false)
  const setAlertData = useSetAtom(alertAtom)

  const days = useMemo(() => {
    const currentDate = convertTZ(new Date(), 'Europe/Moscow')
    const previousDate = convertTZ(new Date(), 'Europe/Moscow').minus({day: 1})

    setDate(currentDate)

    return {
      current: currentDate,
      previous: previousDate,
      today: currentDate,
    }
  }, [])

  const sendData = async () => {
    if (!salaryData.length)
      return setAlertData({
        title: 'Ошибка',
        message: 'Нет данных для отправки',
        color: 'danger',
      })

    const data = {
      salaryData,
      // @ts-ignore
      date: date?.toISO() || '',
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

  useEffect(() => {
    fetch('/api/getLocationSalary', {
      method: 'POST',
      body: JSON.stringify({date: date?.toISO()}),
    }).then(async res => {
      const data: {data: WorkerSalary[]} = await res.json()

      setSalaryData(data.data)
    })
  }, [date])

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
        canEdit,
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
        canEdit,
      }}
    />
  )
}
