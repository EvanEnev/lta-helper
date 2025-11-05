import getSalaryData from '@/lib/functions/getSalaryData'
import {
  LTFaceIdData,
  LTGamePayment,
  LTLocation,
  LTRank,
  LTWorker,
  LTWorkType,
  WorkerSalary,
} from '@/src/utils/types'
import {
  Autocomplete,
  AutocompleteItem,
  AutocompleteSection,
  Checkbox,
  Divider,
  Input,
  NumberInput,
  Select,
  SelectItem,
  Textarea,
} from '@heroui/react'
import {Key, useCallback, useMemo, useRef} from 'react'
import groupBy from '@/lib/functions/groupBy'
import RankIcon from '@/src/components/global/RankIcon'
import {evaluate} from 'mathjs'
import LocationSelect from '@/src/components/global/LocationSelect'
import FormulaInput from '@/src/components/global/FormulaInput'
import {DateTime} from 'luxon'
import CellChip from '@/src/components/salary/CellChip'

type WorkDataProps = {
  faceId: LTFaceIdData[]
  data: WorkerSalary
  setData: any
  workers: LTWorker[]
  index: number
  locations: LTLocation[]
  ranks: LTRank[]
  worker: LTWorker
  workTypes: LTWorkType[]
  gamesPayments: LTGamePayment[]
}

const types = [
  'Отзывы',
  'Бонус за продажи',
  'Бонусный оборот',
  'Премия',
  'Отпуск',
  'Больничный',
]

export default function WorkData({
  faceId,
  data,
  setData,
  workers,
  index,
  locations,
  ranks,
  worker: user,
  workTypes,
  gamesPayments,
}: WorkDataProps) {
  // @ts-ignore
  const ref = useRef()
  const worker = workers.find(
    (worker: {name: string}) =>
      worker.name?.toLowerCase() === data.worker?.toLowerCase(),
  )

  const locationId = useMemo(() => {
    return locations.find(l => l.name === data.location)?.id || -1
  }, [data.location, locations])

  const faceIdData = useMemo(() => {
    const workerId = workers.find(
      w => w.name?.toLowerCase() === data.worker?.toLowerCase(),
    )?.id

    if (!workerId) return null

    const faceIdResult: {location: LTLocation; date: string}[] | undefined =
      faceId
        .find(d => d.workerId === workerId)
        ?.data?.sort(
          (d1, d2) =>
            DateTime.fromFormat(d1.date, 'yyyy-MM-dd HH:mm:ss').valueOf() -
            DateTime.fromFormat(d2.date, 'yyyy-MM-dd HH:mm:ss').valueOf(),
        )
        ?.map(d => ({
          ...d,
          date: DateTime.fromFormat(d.date, 'yyyy-MM-dd HH:mm:ss').toFormat(
            'dd.MM.yyyy HH:mm:ss',
          ),
        })) || []

    const faceIdData: [
      {location: LTLocation; date: string} | null,
      {location: LTLocation; date: string} | null,
    ] = [faceIdResult[0] || null, null]

    if (faceIdResult?.length && faceIdResult?.length > 2) {
      faceIdData[1] = faceIdResult[faceIdResult?.length - 1] || null
    }

    return faceIdData
  }, [faceId, data.worker, workers])

  const updateData = useCallback(
    (
      key:
        | 'worker'
        | 'location'
        | 'workingHours'
        | 'bonuses'
        | 'comment'
        | 'isHardTime'
        | 'gamesCount'
        | 'hasGames'
        | 'value'
        | 'overwork'
        | 'fines'
        | 'type'
        | 'withoutDate'
        | 'oneGames'
        | 'twoGames'
        | 'threeGames'
        | 'actorGames'
        | 'workTypes',
      value:
        | Key
        | string
        | boolean
        | null
        | undefined
        | number
        | Key[]
        | {id: number; value: number; number: number},
    ) => {
      const currentData = {...data}

      // @ts-ignore
      currentData[key] = value

      setData((prev: WorkerSalary[]) => {
        const newData = [...prev]
        newData[index] = currentData

        return newData
      })
    },
    [data, index, setData],
  )

  const salary = useMemo(() => {
    const rank = ranks.find(d => d.name === worker?.rank)
    if (!rank) return null

    return getSalaryData({
      gamesPayments,
      worker: user,
      rank,
      workingHours: data.location === 'Другое' ? '10-19' : data.workingHours,
      fines: data.fines,
      isHardTime: data.isHardTime,
      comment: data.comment,
      bonuses: data.bonuses,
      oneGames: {
        id: data.oneGames?.id || 0,
        number: data.oneGames?.number || 0,
      },
      twoGames: {
        id: data.twoGames?.id || 0,
        number: data.twoGames?.number || 0,
      },
      threeGames: {
        id: data.threeGames?.id || 0,
        number: data.threeGames?.number || 0,
      },
      actorGames: {
        id: data.actorGames?.id || 0,
        number: data.actorGames?.number || 0,
      },
      override: {
        value: data.value,
        overwork: data.location === 'Другое' ? 0 : data.overwork,
        oneGames: data.oneGames?.value,
        twoGames: data.twoGames?.value,
        threeGames: data.threeGames?.value,
        actorGames: data.actorGames?.value,
      },
    })
  }, [
    ranks,
    gamesPayments,
    user,
    data.workingHours,
    data.fines,
    data.isHardTime,
    data.comment,
    data.bonuses,
    data.location,
    data.value,
    data.overwork,
    data.oneGames?.id,
    data.oneGames?.number,
    data.oneGames?.value,
    data.twoGames?.id,
    data.twoGames?.number,
    data.twoGames?.value,
    data.threeGames?.id,
    data.threeGames?.number,
    data.threeGames?.value,
    data.actorGames?.id,
    data.actorGames?.number,
    data.actorGames?.value,
    worker?.rank,
  ])

  const groupedWorkers: {[key: string]: LTWorker[]} = useMemo(() => {
    const newWorkers = [...workers].map(w => ({
      ...w,
      rank: w.isFormer ? 'Бывший сотрудник' : w.rank?.trim(),
    }))

    return groupBy(newWorkers, 'rank')
  }, [workers])

  return (
    <div className="flex w-full min-w-[15rem] flex-row gap-2">
      <div
        className="grid w-[15rem] grid-flow-row-dense auto-rows-min grid-cols-2 gap-4"
        // @ts-ignore
        ref={ref}>
        <div className="bg-primary/10 col-span-full mb-2 rounded-lg p-1 font-bold">
          Простановка:
        </div>
        <div className="col-span-full flex flex-col gap-4">
          <Autocomplete
            isRequired
            label="Сотрудник"
            labelPlacement="outside"
            startContent={
              <RankIcon
                className="h-6 w-fit"
                rank={workers.find(w => w.name === data.worker)?.rank || ''}
              />
            }
            selectedKey={data.worker}
            scrollShadowProps={{
              isEnabled: false,
            }}
            onSelectionChange={value => updateData('worker', value)}>
            {Object.entries(groupedWorkers).map(([key, value], index) => {
              const title = (
                <div className="bg-default-100 z-100 flex flex-1 items-center gap-1 rounded-xl px-2 select-none">
                  <RankIcon rank={key} className="h-6 w-fit" /> {key}
                </div>
              )

              return (
                <AutocompleteSection
                  // @ts-ignore
                  title={key === 'null' ? '' : title}
                  key={index}>
                  {value.map(worker => (
                    <AutocompleteItem key={worker.name}>
                      {worker.name}
                    </AutocompleteItem>
                  ))}
                </AutocompleteSection>
              )
            })}
          </Autocomplete>
          <LocationSelect
            dynamicLocationId
            locations={locations}
            callback={value => updateData('location', value?.name)}
            locationId={locationId}
          />
          <Select
            label="Тип работы"
            labelPlacement="outside"
            selectionMode="multiple"
            selectedKeys={data.workTypes?.map(String) || []}
            onSelectionChange={value => updateData('workTypes', [...value])}>
            {workTypes.map(type => (
              <SelectItem key={type.id}>{type.name}</SelectItem>
            ))}
          </Select>
        </div>
        {data.location === 'Другое' && (
          <Select
            label="Тип"
            labelPlacement="outside"
            selectedKeys={[data.type || '']}
            onSelectionChange={value => updateData('type', [...value][0])}>
            {types.map(type => (
              <SelectItem key={type}>{type}</SelectItem>
            ))}
          </Select>
        )}
        <Input
          labelPlacement="outside"
          isRequired
          label="Время работы"
          value={data.workingHours}
          className={data.type ? 'hidden' : 'col-1'}
          onValueChange={value => updateData('workingHours', value)}
        />
        {worker?.rank !== 'Актёр' &&
          gamesPayments
            .filter(d => d.rank !== 12)
            .map((d, index) => {
              return (
                <NumberInput
                  key={index}
                  labelPlacement="outside"
                  classNames={{
                    stepperButton: 'hidden',
                  }}
                  className="col-1"
                  minValue={0}
                  isWheelDisabled
                  label={d.description}
                  onValueChange={value =>
                    // @ts-ignore
                    updateData(d.key, {id: d.id, number: value})
                  }
                />
              )
            })}
        {worker?.rank === 'Актёр' &&
          gamesPayments
            .filter(d => d.rank === 12)
            .map((d, index) => {
              return (
                <NumberInput
                  classNames={{
                    stepperButton: 'hidden',
                  }}
                  key={index}
                  labelPlacement="outside"
                  className="col-1"
                  minValue={0}
                  isWheelDisabled
                  label={d.description}
                  onValueChange={value =>
                    // @ts-ignore
                    updateData(d.key, {id: d.id, number: value})
                  }
                />
              )
            })}
        {worker?.rank !== 'Актёр' && (
          <Checkbox
            onValueChange={value => updateData('isHardTime', value)}
            className="col-1 h-fit">
            Загруз
          </Checkbox>
        )}
        {data.type && data.location === 'Другое' && (
          <Checkbox
            className="col-1 h-fit"
            onValueChange={value => updateData('withoutDate', value)}>
            Без даты
          </Checkbox>
        )}
        {worker?.rank === 'Каменный' && (
          <Checkbox
            onValueChange={value => updateData('hasGames', value)}
            className="col-1 max-w-full">
            Есть игры
          </Checkbox>
        )}
        <FormulaInput
          labelPlacement="outside"
          className="col-2"
          label="Бонусы"
          value={data.bonuses}
          callback={({text, error}) => {
            if (!error) {
              updateData('bonuses', text)
            }
          }}
        />
        <FormulaInput
          labelPlacement="outside"
          className="col-2"
          label="Штрафы"
          value={data.fines}
          callback={({text, error}) => {
            if (!error) {
              updateData('fines', text)
            }
          }}
        />
        <Textarea
          labelPlacement="outside"
          className="col-2 row-span-2 h-full"
          classNames={{inputWrapper: 'h-full!'}}
          label="Комментарий"
          value={data.comment}
          onValueChange={value => updateData('comment', value)}
        />
      </div>
      <Divider
        orientation="vertical"
        className="h-full"
        // @ts-ignore
        style={{height: ref.current?.offsetHeight || 0}}
      />
      <div className="grid w-[15rem] grid-flow-row-dense auto-rows-min grid-cols-2 gap-4">
        <div className="bg-success/10 col-span-full mb-2 rounded-lg p-1 font-bold">
          Результат:
        </div>
        <div className="">
          <NumberInput
            isWheelDisabled
            classNames={{
              stepperButton: 'hidden',
            }}
            labelPlacement="outside"
            label={`Смена ${
              salary?.start_time && salary.end_time
                ? `(${salary?.start_time}-${salary?.end_time})`
                : ''
            }
            :`}
            aria-label="Смена"
            minValue={0}
            className="h-full w-full"
            value={salary?.value || 0}
            onValueChange={value => updateData('value', value)}
          />
        </div>
        <div className={data.type ? 'hidden' : ''}>
          <NumberInput
            isWheelDisabled
            classNames={{
              stepperButton: 'hidden',
            }}
            label={` Переработка ${salary?.overwork_start && salary.overwork_end ? `(${salary.overwork_start}-${salary.overwork_end})` : ''}
            :`}
            labelPlacement="outside"
            minValue={0}
            className="h-full w-full"
            value={salary?.overwork || 0}
            onValueChange={value => {
              updateData('overwork', value)
            }}
          />
        </div>
        <div className="">
          <p>
            Бонусы/штрафы:{' '}
            {evaluate(`${salary?.bonuses || 0} + ${salary?.fines || 0}`)}
          </p>
        </div>
        <div className={data.type ? 'hidden' : ''}>
          <NumberInput
            isWheelDisabled
            classNames={{
              stepperButton: 'hidden',
            }}
            label="1-час. игры:"
            labelPlacement="outside"
            minValue={0}
            className="h-full w-full"
            value={data.oneGames?.value || salary?.oneGames}
            onValueChange={value => {
              const existingData = data.oneGames
              if (!existingData) return
              updateData('oneGames', {
                id: existingData.id,
                number: existingData.number,
                value,
              })
            }}
          />
        </div>
        <div className={data.type ? 'hidden' : ''}>
          <NumberInput
            isWheelDisabled
            classNames={{
              stepperButton: 'hidden',
            }}
            label="2-час. игры:"
            labelPlacement="outside"
            minValue={0}
            className="h-full w-full"
            value={data.twoGames?.value || salary?.twoGames}
            onValueChange={value => {
              const existingData = data.oneGames
              if (!existingData) return
              updateData('twoGames', {
                id: existingData.id,
                number: existingData.number,
                value,
              })
            }}
          />
        </div>
        <div className={data.type ? 'hidden' : ''}>
          <NumberInput
            isWheelDisabled
            classNames={{
              stepperButton: 'hidden',
            }}
            label="3-час. игры:"
            labelPlacement="outside"
            minValue={0}
            className="h-full w-full"
            value={data.threeGames?.value || salary?.threeGames}
            onValueChange={value => {
              const existingData = data.oneGames
              if (!existingData) return
              updateData('threeGames', {
                id: existingData.id,
                number: existingData.number,
                value,
              })
            }}
          />
        </div>
        <div className={data.type ? 'hidden' : ''}>
          <NumberInput
            isWheelDisabled
            classNames={{
              stepperButton: 'hidden',
            }}
            label="акт. игры:"
            labelPlacement="outside"
            minValue={0}
            className="h-full w-full"
            value={data.actorGames?.value || salary?.actorGames}
            onValueChange={value => {
              const existingData = data.oneGames
              if (!existingData) return
              updateData('actorGames', {
                id: existingData.id,
                number: existingData.number,
                value,
              })
            }}
          />
        </div>
        <div />
        <CellChip className="h-full">Вход</CellChip>
        <CellChip
          className={
            !faceIdData || !faceIdData[0] ? 'text-foreground/50' : 'h-fit'
          }>
          {faceIdData && faceIdData[0] ? faceIdData[0]?.date : <i>Нет</i>}
        </CellChip>
        <CellChip className="h-full">Выход</CellChip>
        <CellChip
          className={
            !faceIdData || !faceIdData[1] ? 'text-foreground/50' : 'h-fit'
          }>
          {faceIdData && faceIdData[1] ? faceIdData[1]?.date : <i>Нет</i>}
        </CellChip>
      </div>
    </div>
  )
}
