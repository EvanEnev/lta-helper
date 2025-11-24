'use client'

import convertTZ from '@/lib/functions/convertTZ'
import DesktopAdmin from '@/src/components/admin/DesktopAdmin'
import MobileAdmin from '@/src/components/admin/MobileAdmin'
import useIsMobile from '@/src/hooks/useIsMobile'
import {
  LTFaceIdData,
  LTGamePayment,
  LTLocation,
  LTRank,
  LTWorker,
  LTWorkType,
  WorkerSalary,
} from '@/src/utils/types'
import {useEffect, useMemo, useState} from 'react'
import {DateTime} from 'luxon'
import {addToast} from '@heroui/react'
import {useAuth} from '@/src/components/global/providers/authProvider'

interface AdminPageProps {
  workers: LTWorker[]
  canEdit: boolean
  locations: LTLocation[]
  ranks: LTRank[]
  workTypes: LTWorkType[]
  gamesPayments: LTGamePayment[]
}

const defaultSalaryData: WorkerSalary = {
  worker: '',
  workingHours: '',
  createdAt: null,
  location: '',
  bonuses: '',
  fines: '',
  comment: '',
  isHardTime: false,
  gamesCount: 1,
  oneGames: null,
  twoGames: null,
  threeGames: null,
  actorGames: null,
  workTypes: [],
}

export default function AdminPage({
  workers = [],
  ranks,
  canEdit,
  locations,
  workTypes,
  gamesPayments,
}: AdminPageProps) {
  const {worker} = useAuth()
  const isMobile = useIsMobile()
  const [salaryData, setSalaryData] = useState<WorkerSalary[]>([
    defaultSalaryData,
  ])
  const [date, setDate] = useState<DateTime>(
    convertTZ(new Date(), 'Europe/Moscow'),
  )
  const [faceId, setFaceIdData] = useState<LTFaceIdData[]>([])
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

    if (salaryData.some(d => d.location !== 'Другое' && !d.workTypes?.length)) {
      return addToast({
        title: 'Ошибка!',
        description: 'Не указаны типы работ',
        color: 'warning',
      })
    }

    const data = {
      salaryData,
      // @ts-ignore
      date: date?.toISO() || '',
    }

    setLoading(true)

    const response = await fetch('/api/salary/send', {
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
        setSalaryData([defaultSalaryData])
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
    if (worker.locationId) {
      fetch('/api/salary/getLocationData', {
        method: 'POST',
        body: JSON.stringify({date: date?.toISO()}),
      }).then(async res => {
        const data: {data: WorkerSalary[]; faceId: LTFaceIdData[]} =
          await res.json()

        if (data.faceId.length) {
          setFaceIdData(data.faceId)
        }

        if (data.data.length) {
          setSalaryData(
            data.data.map(v => ({
              ...v,
              value: v.value || undefined,
              overwork: v.overwork || undefined,
            })),
          )
        } else {
          setSalaryData([defaultSalaryData])
        }
      })
    }
  }, [date, worker.locationId])

  return isMobile ? (
    <MobileAdmin
      {...{
        faceId,
        gamesPayments,
        workTypes,
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
        faceId,
        gamesPayments,
        workTypes,
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
