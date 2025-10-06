import getSalaryData from '@/lib/functions/getSalaryData'
import {
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
  Input,
  NumberInput,
  Select,
  SelectItem,
  Textarea,
} from '@heroui/react'
import {Key, useCallback, useMemo} from 'react'
import groupBy from '@/lib/functions/groupBy'
import RankIcon from '@/src/components/global/RankIcon'
import {evaluate} from 'mathjs'
import LocationSelect from '@/src/components/global/LocationSelect'
import FormulaInput from '@/src/components/global/FormulaInput'

type WorkDataProps = {
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
  const worker = workers.find(
    (worker: {name: string}) =>
      worker.name?.toLowerCase() === data.worker?.toLowerCase(),
  )

  const locationId = useMemo(() => {
    return locations.find(l => l.name === data.location)?.id || -1
  }, [data.location, locations])

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
        | {id: number; value: number},
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
      worker: user,
      rank,
      workingHours: data.location === 'Другое' ? '10-19' : data.workingHours,
      fines: data.fines,
      isHardTime: data.isHardTime,
      gamesCount: data.gamesCount,
      comment: data.comment,
      bonuses: data.bonuses,
      value: data.location === 'Другое' ? data.value || 0 : data.value,
      overwork: data.location === 'Другое' ? 0 : data.overwork,
      oneGames: data.oneGames,
      twoGames: data.twoGames,
      threeGames: data.threeGames,
    })
  }, [
    ranks,
    user,
    data.location,
    data.workingHours,
    data.fines,
    data.isHardTime,
    data.gamesCount,
    data.comment,
    data.bonuses,
    data.value,
    data.overwork,
    data.oneGames,
    data.twoGames,
    data.threeGames,
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
    <div className="grid w-full min-w-[15rem] grid-flow-row-dense auto-rows-min grid-cols-2 gap-4">
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
                className="col-1"
                minValue={0}
                isWheelDisabled
                label={d.description}
                // @ts-ignore
                onValueChange={value => updateData(d.key, {id: d.id, value})}
              />
            )
          })}
      {worker?.rank === 'Актёр' &&
        gamesPayments
          .filter(d => d.rank === 12)
          .map((d, index) => {
            return (
              <NumberInput
                key={index}
                labelPlacement="outside"
                className="col-1"
                minValue={0}
                isWheelDisabled
                label={d.description}
                onValueChange={value =>
                  // @ts-ignore
                  updateData(d.key, {id: d.id, value})
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
      <div className="col-2">
        <p>
          Смена{' '}
          {salary?.start_time &&
            salary.end_time &&
            `(${salary.start_time}-${salary.end_time})`}
          :
        </p>
        <NumberInput
          labelPlacement="outside"
          aria-label="Смена"
          minValue={0}
          className="h-full w-full"
          value={salary?.value || 0}
          onValueChange={value => updateData('value', value)}
        />
      </div>
      <div className={data.type ? 'hidden' : 'col-2'}>
        <p>
          Переработка{' '}
          {salary?.overwork_start &&
            salary.overwork_end &&
            `(${salary.overwork_start}-${salary.overwork_end})`}
          :
        </p>
        <NumberInput
          aria-label="Переработка"
          minValue={0}
          className="h-full w-full"
          value={salary?.overwork || 0}
          onValueChange={value => {
            updateData('overwork', value)
          }}
        />
      </div>
      <div className="col-2">
        <p>
          Бонусы/штрафы:{' '}
          {evaluate(`${salary?.bonuses || 0} + ${salary?.fines || 0}`)}
        </p>
      </div>
    </div>
  )
}
