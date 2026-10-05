'use client'

import {useEffect, useState} from 'react'
import {DateTime} from 'luxon'
import {Loader2, Plus, Send} from 'lucide-react'
import {Button} from '@/components/ui/button'
import {Card, CardContent} from '@/components/ui/card'
import fetchHandler from '@/src/utils/global/fetchHandler'
import type {
  LTFaceIdData,
  LTGamePayment,
  LTLocation,
  LTRank,
  LTWorker,
  LTWorkType,
  WorkerSalary,
} from '@/src/utils/types'
import DateField from './DateField'
import EntryCard from './EntryCard'
import {
  TYPED_LOCATION,
  canConfirmDate,
  emptyEntry,
  entryStatus,
  nowInZone,
} from './utils'

interface AdminPageProps {
  worker: LTWorker
  workers: LTWorker[]
  canEdit: boolean
  locations: LTLocation[]
  ranks: LTRank[]
  workTypes: LTWorkType[]
  gamesPayments: LTGamePayment[]
}

export default function AdminPage({
  workers = [],
  ranks,
  canEdit,
  locations,
  workTypes,
  gamesPayments,
  worker,
}: AdminPageProps) {
  const [salaryData, setSalaryData] = useState<WorkerSalary[]>([emptyEntry()])
  const [date, setDate] = useState<DateTime>(nowInZone())
  const [faceId, setFaceId] = useState<LTFaceIdData[]>([])
  const [isLoading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  // после отправки записи перечитываются, чтобы появились «проставлена» и «подтверждена»
  const [reloadKey, setReloadKey] = useState(0)
  // на телефоне формы свёрнуты в аккордеон, раскрыта одна
  const [openIndex, setOpenIndex] = useState<number | null>(0)

  // у площадочного администратора записи за день подгружаются с сервера
  useEffect(() => {
    if (!worker.locationId) return

    let cancelled = false

    fetch('/api/salary/getLocationData', {
      method: 'POST',
      body: JSON.stringify({date: date.toISO()}),
    })
      .then(async res => {
        if (!res.ok) return

        const data: {data: WorkerSalary[]; faceId: LTFaceIdData[]} =
          await res.json()

        if (cancelled) return

        if (data.faceId?.length) setFaceId(data.faceId)

        setSalaryData(
          data.data?.length
            ? data.data.map(v => ({
                ...v,
                value: v.value || undefined,
                overwork: v.overwork || undefined,
              }))
            : [emptyEntry()],
        )
        setOpenIndex(0)
      })
      .catch(() => {})

    return () => {
      cancelled = true
    }
  }, [date, worker.locationId, reloadKey])

  const patchEntry = (index: number, patch: Partial<WorkerSalary>) => {
    setError(null)
    setSalaryData(prev =>
      prev.map((entry, i) => (i === index ? {...entry, ...patch} : entry)),
    )
  }

  const addEntry = () => {
    setSalaryData(prev => [...prev, emptyEntry(prev[prev.length - 1])])
    setOpenIndex(salaryData.length)
  }

  const hideEntry = (index: number) => {
    setSalaryData(prev => prev.filter((_, i) => i !== index))
    setOpenIndex(prev => {
      if (prev === null || prev === index) return null

      return prev > index ? prev - 1 : prev
    })
  }

  const toggleDeleted = (index: number) =>
    patchEntry(index, {deleted: salaryData[index].deleted ? 0 : 1})

  const filledEntries = salaryData.filter(entry => entry.worker)
  const filled = filledEntries.length
  const counts = {
    new: filledEntries.filter(entry => entryStatus(entry) === 'new').length,
    saved: filledEntries.filter(entry => entryStatus(entry) === 'saved').length,
    confirmed: filledEntries.filter(entry => entryStatus(entry) === 'confirmed')
      .length,
  }
  const canConfirm = canConfirmDate(date)
  const deleting = salaryData.filter(
    entry => entry.worker && entry.deleted,
  ).length

  const sendData = async () => {
    if (!filled) return setError('Нет данных для отправки')

    if (
      salaryData.some(
        entry => entry.location !== TYPED_LOCATION && !entry.workTypes?.length,
      )
    ) {
      return setError('Не указаны типы работ')
    }

    setError(null)
    setLoading(true)

    try {
      const response = await fetchHandler({
        url: '/api/salary/send',
        method: 'POST',
        body: {salaryData, date: date.toISO() || ''},
      })

      if (response) {
        if (worker.locationId) {
          setReloadKey(key => key + 1)
        } else {
          setSalaryData([emptyEntry()])
          setOpenIndex(0)
        }
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="flex w-full min-w-0 flex-col gap-4 p-4 lg:grid lg:grid-cols-[minmax(0,1fr)_18rem] lg:items-start">
      {/* на телефоне порядок: дата, записи, действия; на десктопе справа */}
      <aside className="contents lg:sticky lg:top-4 lg:col-start-2 lg:row-start-1 lg:flex lg:flex-col lg:gap-4">
        <Card className="order-1 lg:order-none">
          <CardContent>
            <DateField value={date} canEditAll={canEdit} onChange={setDate} />
          </CardContent>
        </Card>

        <Card className="order-3 lg:order-none">
          <CardContent className="flex flex-col gap-3">
            <dl className="flex flex-col gap-1.5 text-sm">
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Не проставлено</dt>
                <dd className="font-medium tabular-nums">{counts.new}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-warning">Ждут подтверждения</dt>
                <dd className="font-medium tabular-nums">{counts.saved}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-success">Подтверждено</dt>
                <dd className="font-medium tabular-nums">{counts.confirmed}</dd>
              </div>
            </dl>
            {counts.saved > 0 && canConfirm && (
              <p className="text-muted-foreground text-xs">
                Чтобы подтвердить, отправьте записи ещё раз.
              </p>
            )}
            {deleting > 0 && (
              <div className="text-destructive flex justify-between text-sm">
                <span>Будет удалено</span>
                <span className="font-medium tabular-nums">{deleting}</span>
              </div>
            )}
            {error && (
              <p role="alert" className="text-destructive text-sm">
                {error}
              </p>
            )}
            <Button
              variant="secondary"
              size="lg"
              className="h-11"
              onClick={addEntry}>
              <Plus />
              Добавить
            </Button>
            <Button
              size="lg"
              className="h-12 text-base"
              disabled={isLoading}
              onClick={sendData}>
              {isLoading ? <Loader2 className="animate-spin" /> : <Send />}
              Отправить
            </Button>
          </CardContent>
        </Card>
      </aside>

      <section className="order-2 grid min-w-0 grid-cols-[repeat(auto-fill,minmax(min(100%,19rem),1fr))] gap-3 lg:order-none lg:col-start-1 lg:row-start-1 lg:items-start">
        {salaryData.map((data, index) => (
          <EntryCard
            key={index}
            index={index}
            data={data}
            user={worker}
            workers={workers}
            ranks={ranks}
            locations={locations}
            workTypes={workTypes}
            gamesPayments={gamesPayments}
            faceId={faceId}
            canConfirm={canConfirm}
            isOpen={openIndex === index}
            onToggle={() =>
              setOpenIndex(prev => (prev === index ? null : index))
            }
            onChange={patch => patchEntry(index, patch)}
            onDelete={() => toggleDeleted(index)}
            onHide={() => hideEntry(index)}
          />
        ))}
        {salaryData.length === 0 && (
          <p className="text-muted-foreground col-span-full py-10 text-center text-sm">
            Записей нет. Нажмите «Добавить»
          </p>
        )}
      </section>
    </main>
  )
}
