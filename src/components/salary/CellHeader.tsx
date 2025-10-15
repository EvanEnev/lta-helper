import {SalaryData} from '@/src/utils/types'
import {Divider, Input, TimeInput, Tooltip} from '@heroui/react'
import {useMemo} from 'react'
import CellChip from '@/src/components/salary/CellChip'
import {DateTime} from 'luxon'
import {BillCheck, BillCross, Ruble} from 'solar-icon-set'
import LocationIcon from '@/src/components/global/LocationIcon'

export default function CellHeader({
  data,
  canEdit,
}: {
  data: SalaryData
  canEdit: boolean
}) {
  const time = useMemo(() => {
    const startTime = data.start_time.slice(0, -3)
    const endTime = data.end_time.slice(0, -3)

    return {
      start: {
        hour: startTime.split(':')[0],
        minute: startTime.split(':')[1],
      },
      end: {
        hour: endTime.split(':')[0],
        minute: endTime.split(':')[1],
      },
    }
  }, [data.start_time, data.end_time])

  const overWorkTime = useMemo(() => {
    if (!(data.overwork_start && data.overwork_end)) {
      return {}
    }

    const startTime =
      data.overwork_start === '--' ? '--' : data.overwork_start.slice(0, -3)
    const endTime =
      data.overwork_end === '--' ? '--' : data.overwork_end.slice(0, -3)

    return {
      start: {
        hour: startTime.split(':')[0],
        minute: startTime.split(':')[1],
      },
      end: {
        hour: endTime.split(':')[0],
        minute: endTime.split(':')[1],
      },
    }
  }, [data.overwork_start, data.overwork_end])

  const date = useMemo(
    () => DateTime.fromISO(data.created_at),
    [data.created_at],
  )

  return (
    <>
      <div className={`col-span-2 flex items-center justify-center gap-1`}>
        <Tooltip
          content={
            <p className="text-xs">
              {data.created_by} {date.toFormat('dd.MM yyyy')}
            </p>
          }>
          <div className="flex items-center gap-2">
            <LocationIcon locationName={data.location.name} />
            <p>{data.location.name}</p>
          </div>
        </Tooltip>
      </div>
      {data.type && (
        <CellChip className="glass text-foreground text-small col-span-2 mb-2 items-center justify-center">
          {data.type}
        </CellChip>
      )}
      <p className="col-span-2 text-xs">Смена</p>
      <TimeInput
        aria-label="Начало смены"
        className={data.type ? 'hidden' : ''}
        // @ts-ignore
        value={time.start}
        isReadOnly
      />
      <TimeInput
        aria-label="Конец смены"
        className={data.type ? 'hidden' : ''}
        // @ts-ignore
        value={time.end}
        isReadOnly
      />
      <CellChip className="text-foreground text-small col-span-2 flex justify-between">
        {data.value.toString()} <Ruble />
      </CellChip>
      <Divider className="col-span-2 w-full" />
      <p className={`col-span-2 text-xs ${data.type ? 'hidden' : ''}`}>
        Переработка
      </p>
      {/*// @ts-ignore*/}
      <TimeInput
        aria-label="Начало переработки"
        className={data.type ? 'hidden' : ''}
        isReadOnly
        // @ts-ignore
        value={overWorkTime.start}
      />
      {/*// @ts-ignore*/}
      <TimeInput
        aria-label="Конец переработки"
        className={data.type ? 'hidden' : ''}
        isReadOnly
        // @ts-ignore
        value={overWorkTime.end}
      />
      <CellChip
        className={`${data.type ? 'hidden!' : ''} text-foreground text-small col-span-2 flex justify-between`}>
        {data.overwork?.toString() || ''} <Ruble className="ml-auto" />
      </CellChip>
      {(data.oneGames?.number || canEdit) && (
        <>
          <CellChip className="text-foreground text-small">1 час</CellChip>
          <CellChip className="text-foreground text-small flex justify-between">
            {data.oneGames?.number || 0} ({data.oneGames?.value || 0}{' '}
            <Ruble iconStyle="Bold" />)
          </CellChip>
        </>
      )}
      {(data.twoGames?.number || canEdit) && (
        <>
          <CellChip className="text-foreground text-small">2 часа</CellChip>
          <CellChip className="text-foreground text-small flex justify-between">
            {data.twoGames?.number || 0} ({data.twoGames?.value || 0}{' '}
            <Ruble iconStyle="Bold" />)
          </CellChip>
        </>
      )}
      {(data.threeGames?.number || canEdit) && (
        <>
          <CellChip className="text-foreground text-small">3 часа</CellChip>
          <CellChip className="text-foreground text-small flex justify-between">
            {data.threeGames?.number || 0} ({data.threeGames?.value || 0}{' '}
            <Ruble iconStyle="Bold" />)
          </CellChip>
        </>
      )}
      {(data.actorGames?.number || canEdit) && (
        <>
          <CellChip className="text-foreground text-small">актёр</CellChip>
          <CellChip className="text-foreground text-small flex justify-between">
            {data.actorGames?.number || 0} ({data.actorGames?.value || 0}{' '}
            <Ruble iconStyle="Bold" />)
          </CellChip>
        </>
      )}
      <Divider className={`col-span-2 ${data.type ? 'hidden' : ''}`} />
      <div className="col-span-full flex items-center gap-1">
        <BillCheck iconStyle="Bold" size={22} />
        <p>Бонусы</p>
      </div>
      <Input
        aria-label="Бонусы"
        className="col-span-full w-full justify-self-end text-end"
        isReadOnly
        value={data.bonuses || ''}
      />
      <div
        className={`col-span-full flex items-center gap-1 ${data.type ? 'hidden' : ''}`}>
        <BillCross iconStyle="Bold" size={22} />
        <p>Штрафы</p>
      </div>
      <Input
        aria-label="Штрафы"
        className={`col-span-full w-full justify-self-end text-end ${data.type ? 'hidden' : ''}`}
        isReadOnly
        value={data.fines || ''}
      />
    </>
  )
}
