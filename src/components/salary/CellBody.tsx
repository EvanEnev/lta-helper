import {LTFaceIdData, SalaryData} from '@/src/utils/types'
import {Divider, TimeInput, Tooltip} from '@heroui/react'
import {memo} from 'react'
import CellChip from '@/src/components/salary/CellChip'
import {DateTime} from 'luxon'
import {BillCheck, BillCross, Ruble} from 'solar-icon-set'
import {evaluate} from 'mathjs'

export default function CellBody({
  data,
  faceId = [],
  isReviewMode,
  time,
  overworkTime,
}: {
  data: SalaryData
  faceId?: LTFaceIdData['data']
  isReviewMode: boolean
  time: {
    start: {hour: string; minute: string}
    end: {hour: string; minute: string}
  }
  overworkTime: {
    start: {hour: string; minute: string}
    end: {hour: string; minute: string}
  }
}) {
  // @ts-ignore
  faceId = faceId
    .filter(d => d.location.id === data.location.id)
    .sort(
      (d1, d2) =>
        DateTime.fromFormat(d1.date, 'yyyy-MM-dd HH:mm:ss').valueOf() -
        DateTime.fromFormat(d2.date, 'yyyy-MM-dd HH:mm:ss').valueOf(),
    )
    .map(d => ({
      ...d,
      date: DateTime.fromFormat(d.date, 'yyyy-MM-dd HH:mm:ss'),
    }))

  const Games = memo(function Games() {
    if (!isReviewMode)
      return (
        <>
          <CellChip className="col-span-full border-2 bg-transparent text-inherit">
            Проведение игр
          </CellChip>
          <CellChip className="text-foreground text-small col-span-full flex justify-between">
            {(data.oneGames?.value || 0) +
              (data.twoGames?.value || 0) +
              (data.threeGames?.value || 0)}{' '}
            <Ruble iconStyle="Bold" />
          </CellChip>
          <CellChip className="col-span-full border-2 bg-transparent text-inherit">
            Актёрские игры
          </CellChip>
          <CellChip className="text-foreground text-small col-span-full flex justify-between">
            {data.actorGames?.value || 0} <Ruble iconStyle="Bold" />
          </CellChip>
        </>
      )

    return (
      <>
        <CellChip className="border-2 bg-transparent text-inherit">
          1. час
        </CellChip>
        <CellChip>
          {data.oneGames?.value} ({data.oneGames?.number})
        </CellChip>
        <CellChip className="border-2 bg-transparent text-inherit">
          2. час
        </CellChip>
        <CellChip>
          {data.twoGames?.value} ({data.twoGames?.number})
        </CellChip>
        <CellChip className="border-2 bg-transparent text-inherit">
          3. час
        </CellChip>
        <CellChip>
          {data.threeGames?.value} ({data.threeGames?.number})
        </CellChip>
        <CellChip className="border-2 bg-transparent text-inherit">
          Акт. час
        </CellChip>
        <CellChip>
          {data.actorGames?.value} ({data.actorGames?.number})
        </CellChip>
      </>
    )
  })

  return (
    <>
      {data.type && (
        <CellChip className="glass text-foreground text-small col-span-2 mb-2 items-center justify-center">
          {data.type}
        </CellChip>
      )}
      <div className="grid-rows-auto grid grid-flow-row grid-cols-2 gap-2">
        <CellChip className="col-span-full border-2 bg-transparent text-inherit">
          Смена
        </CellChip>
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
        <CellChip className="col-span-full border-2 bg-transparent text-inherit">
          Переработка
        </CellChip>
        <TimeInput
          aria-label="Начало переработки"
          className={data.type ? 'hidden' : ''}
          isReadOnly
          // @ts-ignore
          value={overworkTime.start}
        />
        <TimeInput
          aria-label="Конец переработки"
          className={data.type ? 'hidden' : ''}
          isReadOnly
          // @ts-ignore
          value={overworkTime.end}
        />
        <CellChip
          className={`${data.type ? 'hidden!' : ''} text-foreground text-small col-span-2 flex justify-between`}>
          {data.overwork?.toString() || ''}{' '}
          <Ruble iconStyle="Bold" className="ml-auto" />
        </CellChip>
      </div>
      <Divider orientation="vertical" className="bg-foreground" />
      <div className="grid-rows-auto grid grid-flow-row grid-cols-2 gap-2">
        <Games />
        <CellChip className="col-span-full border-2 bg-transparent text-inherit">
          Вход
        </CellChip>
        <CellChip className="col-span-full">
          {// @ts-ignore
          faceId[0]?.date.toFormat('dd.MM.yyyy HH:mm:ss')}
        </CellChip>
        <CellChip className="col-span-full border-2 bg-transparent text-inherit">
          Выход
        </CellChip>
        <CellChip className="col-span-full">
          {// @ts-ignore
          faceId[faceId.length - 1]?.date.toFormat('dd.MM.yyyy HH:mm:ss')}
        </CellChip>
      </div>
      <div className="col-span-full flex justify-between gap-2">
        <div className="flex w-full flex-col gap-2">
          <CellChip className="col-span-full border-2 bg-transparent text-inherit">
            <BillCheck iconStyle="Bold" size={22} />
            <p>Бонусы</p>
          </CellChip>
          <Tooltip className="w-full" content={<p>{data.bonuses || ''}</p>}>
            <div className="bg-default-100 rounded-medium text-foreground relative col-span-full inline-flex h-10 min-h-10 w-full items-center justify-self-end px-3 text-start">
              {evaluate(data.bonuses || '')}
            </div>
          </Tooltip>
        </div>
        <div className="flex w-full flex-col gap-2">
          <CellChip className="col-span-full border-2 bg-transparent text-inherit">
            <BillCross iconStyle="Bold" size={22} />
            <p>Штрафы</p>
          </CellChip>
          <Tooltip content={<p>{data.fines || ''}</p>}>
            <div className="bg-default-100 rounded-medium text-foreground relative col-span-full inline-flex h-10 min-h-10 w-full items-center justify-self-end px-3 text-start">
              {evaluate(data.fines || '')}
            </div>
          </Tooltip>
        </div>
      </div>
    </>
  )
}
