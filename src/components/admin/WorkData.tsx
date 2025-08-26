import getSalaryData from '@/lib/functions/getSalaryData'
import {LTLocation, LTRank, LTWorker, WorkerSalary} from '@/src/utils/types'
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
import {Key, useCallback, useMemo} from 'react'
import groupBy from '@/lib/functions/groupBy'
import RankIcon from '@/src/components/global/RankIcon'
import {evaluate} from 'mathjs'

type WorkDataProps = {
  data: WorkerSalary
  setData: any
  workers: LTWorker[]
  index: number
  locations: LTLocation[]
  ranks: LTRank[]
  worker: LTWorker
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
}: WorkDataProps) {
  const worker = workers.find(
    (worker: {name: string}) =>
      worker.name?.toLowerCase() === data.worker?.toLowerCase(),
  )

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
        | 'withoutDate',
      value: Key | string | boolean | null | undefined,
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

  const validate = (value: number) => {
    if (value <= 0) {
      return 'Число должно быть положительным'
    }

    return null
  }

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
    })
  }, [
    ranks,
    user,
    data.workingHours,
    data.fines,
    data.isHardTime,
    data.gamesCount,
    data.comment,
    data.bonuses,
    data.value,
    data.location,
    data.overwork,
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
    <div className="flex w-full flex-col gap-4">
      <Autocomplete
        isRequired
        label="Сотрудник"
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
      <Autocomplete
        isRequired
        label="Локация"
        selectedKey={data.location}
        onSelectionChange={value => updateData('location', value)}>
        {locations.map(location => (
          <AutocompleteItem key={location.name}>
            {location.name}
          </AutocompleteItem>
        ))}
      </Autocomplete>
      {data.location === 'Другое' && (
        <Select
          label="Тип"
          selectedKeys={[data.type || '']}
          onSelectionChange={value => updateData('type', [...value][0])}>
          {types.map(type => (
            <SelectItem key={type}>{type}</SelectItem>
          ))}
        </Select>
      )}
      <Input
        isRequired
        label="Время работы"
        value={data.workingHours}
        className={data.type ? 'hidden' : ''}
        onValueChange={value => updateData('workingHours', value)}
      />
      {data.type && (
        <Checkbox onValueChange={value => updateData('withoutDate', value)}>
          Без даты
        </Checkbox>
      )}
      {worker?.rank === 'Каменный' && (
        <Checkbox
          onValueChange={value => updateData('hasGames', value)}
          className="max-w-full">
          Есть игры
        </Checkbox>
      )}
      {worker?.rank === 'Актёр' ? (
        <NumberInput
          label="Кол-во игр"
          type="number"
          validate={validate}
          value={data.gamesCount}
          onValueChange={value => updateData('gamesCount', value)}
        />
      ) : (
        <Checkbox
          onValueChange={value => updateData('isHardTime', value)}
          className="max-w-full">
          Загруз
        </Checkbox>
      )}
      <Input
        label="Бонусы"
        value={data.bonuses}
        onValueChange={value => updateData('bonuses', value)}
      />
      <Input
        label="Штрафы"
        value={data.fines}
        onValueChange={value => updateData('fines', value)}
      />
      <Textarea
        label="Комментарий"
        value={data.comment}
        onValueChange={value => updateData('comment', value)}
      />
      <Divider />
      <div className="flex flex-col gap-2">
        <div>
          <p>
            Смена{' '}
            {salary?.start_time &&
              salary.end_time &&
              `(${salary.start_time}-${salary.end_time})`}
            :
          </p>
          <NumberInput
            onScroll={undefined}
            aria-label="Смена"
            minValue={0}
            className="h-full w-full"
            value={salary?.value || 0}
            onValueChange={value => updateData('value', value)}
          />
        </div>
        <div className={data.type ? 'hidden' : ''}>
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
        <div>
          <p>
            Бонусы/штрафы:{' '}
            {evaluate(`${salary?.bonuses || 0} + ${salary?.fines || 0}`)}
          </p>
        </div>
      </div>
    </div>
  )
}
