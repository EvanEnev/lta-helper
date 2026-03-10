import {LTFaceIdData, SalaryData} from '@/src/utils/types'
import {Divider, Tooltip} from '@heroui/react'
import {TimeField, DateField} from '@heroui/react-beta'
import {parseTime} from '@internationalized/date'
import CellChip from '@/src/components/salary/CellChip'
import {evaluate} from 'mathjs'
import {Icon} from '@iconify/react'

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
  time: string
  overworkTime: string | null
}) {
  const Games = function Games() {
    if (data.type) {
      return null
    }

    if (!isReviewMode)
      return (
        <>
          <CellChip className="col-span-full border-2 bg-transparent text-inherit">
            Проведение
          </CellChip>
          <CellChip className="text-foreground text-small col-span-full flex justify-between">
            {(data.oneGames?.value || 0) +
              (data.twoGames?.value || 0) +
              (data.threeGames?.value || 0)}{' '}
            <Icon icon="solar:ruble-bold" width="24" height="24" />
          </CellChip>
          <CellChip className="col-span-full border-2 bg-transparent text-inherit">
            Актёрские
          </CellChip>
          <CellChip className="text-foreground text-small col-span-full flex justify-between">
            {data.actorGames?.value || 0}{' '}
            <Icon icon="solar:ruble-bold" width="24" height="24" />
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
  }

  return (
    <>
      {data.type && (
        <CellChip className="glass text-foreground text-small col-span-full mb-2 items-center justify-center">
          {data.type}
        </CellChip>
      )}
      <div
        className={`grid-rows-auto grid grid-flow-row grid-cols-2 gap-2 ${data.type ? 'col-span-full' : ''}`}>
        <CellChip className="col-span-full border-2 bg-transparent text-inherit">
          Смена
        </CellChip>
        {!data.type && (
          <>
            <TimeField
              // @ts-ignore
              value={parseTime(
                time.split('-')[0].startsWith('24')
                  ? '00:' + time.split('-')[0].split(':')[1]
                  : time.split('-')[0],
              )}
              isReadOnly
              name="workStart">
              <DateField.Group
                variant="secondary"
                className="items-center justify-center">
                <DateField.Input>
                  {segment => <DateField.Segment segment={segment} />}
                </DateField.Input>
              </DateField.Group>
            </TimeField>
            <TimeField
              // @ts-ignore
              value={parseTime(
                time.split('-')[1].startsWith('24')
                  ? '00:' + time.split('-')[1].split(':')[1]
                  : time.split('-')[1],
              )}
              isReadOnly
              name="workEnd">
              <DateField.Group
                variant="secondary"
                className="items-center justify-center">
                <DateField.Input>
                  {segment => <DateField.Segment segment={segment} />}
                </DateField.Input>
              </DateField.Group>
            </TimeField>
          </>
        )}
        <CellChip className="text-foreground text-small col-span-2 flex justify-between">
          {data.value?.toString()}{' '}
          <Icon icon="solar:ruble-bold" width="24" height="24" />
        </CellChip>
        {!data.type && (
          <>
            <CellChip className="col-span-full border-2 bg-transparent text-inherit">
              Переработка
            </CellChip>
            <TimeField
              // @ts-ignore
              value={
                overworkTime
                  ? parseTime(
                      overworkTime.split('-')[0].startsWith('24')
                        ? '00:' + overworkTime.split('-')[0].split(':')[1]
                        : overworkTime.split('-')[0],
                    )
                  : null
              }
              isReadOnly
              name="overworkStart">
              <DateField.Group
                variant="secondary"
                className="items-center justify-center">
                <DateField.Input>
                  {segment => <DateField.Segment segment={segment} />}
                </DateField.Input>
              </DateField.Group>
            </TimeField>
            <TimeField
              // @ts-ignore
              value={
                overworkTime
                  ? parseTime(
                      overworkTime.split('-')[1].startsWith('24')
                        ? '00:' + overworkTime.split('-')[1].split(':')[1]
                        : overworkTime.split('-')[1],
                    )
                  : null
              }
              isReadOnly
              name="overworkEnd">
              <DateField.Group variant="secondary">
                <DateField.Input>
                  {segment => <DateField.Segment segment={segment} />}
                </DateField.Input>
              </DateField.Group>
            </TimeField>
            <CellChip
              className={`text-foreground text-small col-span-2 flex justify-between`}>
              {data.overworkValue?.toString() || ''}{' '}
              <Icon
                icon="solar:ruble-bold"
                width="24"
                height="24"
                className="ml-auto"
              />
            </CellChip>
          </>
        )}
      </div>
      {!data.type && (
        <Divider orientation="vertical" className="bg-foreground" />
      )}
      {!data.type && (
        <div className="grid-rows-auto grid grid-flow-row grid-cols-2 gap-2">
          {/*@ts-ignore*/}
          <Games />
          <CellChip className="col-span-full border-2 bg-transparent text-inherit">
            Вход
          </CellChip>
          <CellChip className="text-small col-span-full">
            {data.faceId && data.faceId[0]?.timestamp}
          </CellChip>
          <CellChip className="col-span-full border-2 bg-transparent text-inherit">
            Выход
          </CellChip>
          <CellChip className="text-small col-span-full">
            {data.faceId && data.faceId[data.faceId.length - 1]?.timestamp}
          </CellChip>
        </div>
      )}
      <div className="col-span-full flex justify-between gap-2">
        <div className="flex w-full flex-col gap-2">
          <CellChip className="col-span-full border-2 bg-transparent text-inherit">
            <Icon icon="solar:bill-check-bold" width="22" height="22" />
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
            <Icon icon="solar:bill-cross-bold" width="22" height="22" />
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
