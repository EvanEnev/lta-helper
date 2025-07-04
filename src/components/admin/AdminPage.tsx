'use client'

import convertTZ from '@/lib/functions/convertTZ'
import DesktopAdmin from '@/src/components/admin/DesktopAdmin'
import MobileAdmin from '@/src/components/admin/MobileAdmin'
import useIsMobile from '@/src/hooks/useIsMobile'
import {LTLocation, LTRank, LTWorker, WorkerSalary} from '@/src/utils/types'
import {useEffect, useMemo, useState} from 'react'
import {DateTime} from 'luxon'
import {addToast} from '@heroui/react'
import {useAuth} from '@/src/components/global/providers/authProvider'

interface AdminPageProps {
  workers: LTWorker[]
  canEdit: boolean
  locations: LTLocation[]
  ranks: LTRank[]
}

export default function AdminPage({
  workers = [],
  ranks,
  canEdit,
  locations,
}: AdminPageProps) {
  const {worker} = useAuth()
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
    },
  ])
  const [date, setDate] = useState<DateTime>(
    convertTZ(new Date(), 'Europe/Moscow'),
  )
  const [isLoading, setLoading] = useState<boolean>(false)

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
    const workers = salaryData.map(d => d.worker)

    if (!workers.some(d => d)) {
      return addToast({
        title: 'Ошибка!',
        description: 'Нет данных для отправки',
        color: 'warning',
      })
    }

    const data = {
      salaryData,
      // @ts-ignore
      date: date?.toISO() || '',
    }

    setLoading(true)

    const response = await fetch('/api/sendWorkDays', {
      method: 'POST',
      body: JSON.stringify(data),
    })

    let message = ''

    try {
      const json = await response.json()
      if (json.message) {
        message = json.message
      }
    } catch {}

    if (response.ok) {
      addToast({
        title: 'Успешно!',
        description: message || 'Данные отправлены',
        color: 'success',
        timeout: 8000,
        shouldShowTimeoutProgress: true,
      })

      if (!worker.locationId) {
        setSalaryData([
          {
            worker: '',
            workingHours: '',
            location: '',
            bonuses: '',
            fines: '',
            comment: '',
            isHardTime: false,
            gamesCount: 1,
          },
        ])
      }
    } else {
      addToast({
        title: 'Ошибка!',
        description: message || 'Неизвестная ошибка',
        color: 'danger',
      })
    }

    setLoading(false)
  }

  useEffect(() => {
    fetch('/api/getLocationSalary', {
      method: 'POST',
      body: JSON.stringify({date: date?.toISO()}),
    }).then(async res => {
      const data: {data: WorkerSalary[]} = await res.json()

      if (data.data.length) {
        setSalaryData(data.data)
      }
    })
  }, [date])

  return isMobile ? (
    <MobileAdmin
      {...{
        ranks,
        locations,
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
        ranks,
        sendData,
        locations,
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
