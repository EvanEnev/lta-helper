import {SalaryData} from '@/src/utils/types'
import {Divider, TimeInput, Tooltip} from '@heroui/react'
import {useMemo} from 'react'
import CellChip from '@/src/components/salary/CellChip'
import {DateTime} from 'luxon'
import {BillCheck, BillCross, Ruble} from 'solar-icon-set'
import {evaluate} from "mathjs";

export default function CellBody({
  data,
}: {
  data: SalaryData
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
      {data.type && (
        <CellChip className="glass text-foreground text-small col-span-2 mb-2 items-center justify-center">
          {data.type}
        </CellChip>
      )}
        <div className='gap-2 grid-rows-auto grid grid-flow-row grid-cols-2'>
            <CellChip className="text-inherit col-span-full bg-transparent border-2">Смена</CellChip>
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
                {data.value.toString()} <Ruble iconStyle="Bold" />
            </CellChip>
            {/*<Divider className="col-span-2 w-full" />*/}
            <CellChip className="text-inherit col-span-full bg-transparent border-2">Переработка</CellChip>
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
                {data.overwork?.toString() || ''} <Ruble iconStyle="Bold" className="ml-auto" />
        </CellChip>
        </div>
        <Divider orientation="vertical" className='bg-foreground' />
        <div className='gap-2 grid-rows-auto grid grid-flow-row grid-cols-2'>
            <CellChip className="text-inherit col-span-full bg-transparent border-2">Проведение игр</CellChip>
            <CellChip className="text-foreground text-small flex justify-between col-span-full">
                {(data.oneGames?.value || 0) + (data.twoGames?.value || 0) + (data.threeGames?.value || 0)}{' '}
                <Ruble iconStyle="Bold" />
            </CellChip>
            <CellChip className="text-inherit bg-transparent border-2 col-span-full">Актёрские игры</CellChip>
            <CellChip className="text-foreground text-small flex justify-between col-span-full">
                {(data.actorGames?.value || 0)}{' '}
                <Ruble iconStyle="Bold" />
            </CellChip>
        </div>
        <div className='col-span-full flex justify-between gap-2'>
            <div className='flex flex-col gap-2 w-full'>
                <CellChip className="text-inherit bg-transparent border-2 col-span-full"><BillCheck iconStyle="Bold" size={22} />
                    <p>Бонусы</p>
                </CellChip>
                <Tooltip className='w-full'
                         content={
                    <p>{data.bonuses || ''}</p>
                }>
                    <div className='col-span-full justify-self-end bg-default-100 rounded-medium text-foreground relative inline-flex h-10 min-h-10 w-full items-center px-3 text-start'>{evaluate(data.bonuses || '')}</div>
            </Tooltip>
            </div>
            <div className='flex flex-col gap-2 w-full'>
            <CellChip className="text-inherit bg-transparent border-2 col-span-full">
                <BillCross iconStyle="Bold" size={22} />
                <p>Штрафы</p>
            </CellChip>
                <Tooltip
                    content={
                        <p>{data.fines || ''}</p>
                    }>
                    <div className='col-span-full justify-self-end bg-default-100 rounded-medium text-foreground relative inline-flex h-10 min-h-10 w-full items-center px-3 text-start'>{evaluate(data.fines || '')}</div>
                </Tooltip>
            </div>
        </div>
    </>
  )
}
