import getSalaryData from '@/src/utils/admin/getSalaryData'
import {LTLocation, LTRank, LTWorker, WorkerSalary} from '@/src/utils/types'
import {
  Autocomplete,
  AutocompleteItem,
  AutocompleteSection,
  Checkbox,
  Divider,
  Input,
  NumberInput,
  Textarea,
} from '@heroui/react'
import {Key, useCallback, useMemo} from 'react'
import groupBy from '@/lib/functions/groupBy'
import RankIcon from '@/src/components/global/RankIcon'

type WorkDataProps = {
  data: WorkerSalary
  setData: any
  workers: LTWorker[]
  index: number
  locations: LTLocation[]
  ranks: LTRank[]
}

export default function WorkData({
  data,
  setData,
  workers,
  index,
  locations,
  ranks,
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
        | 'fines',
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
    const salaryData = getSalaryData({
      ranks,
      worker: data.worker,
      rank: worker?.rank || 'актёр',
      workingHours: data.workingHours,
      fines: data.fines,
      isHardTime: data.isHardTime,
      gamesCount: data.gamesCount,
      comment: data.comment,
      bonuses: data.bonuses,
      value: data.value,
      overwork: data.overwork,
    })

    updateData('overwork', salaryData?.overWorkSalary || undefined)

    return salaryData
  }, [
    ranks,
    data.worker,
    data.workingHours,
    data.fines,
    data.isHardTime,
    data.gamesCount,
    data.comment,
    data.bonuses,
    data.value,
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
      <Input
        isRequired
        label="Время работы"
        value={data.workingHours}
        onValueChange={value => updateData('workingHours', value)}
      />
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
            {salary?.calculatedWorkingTime &&
              `(${salary?.calculatedWorkingTime})`}
            :
          </p>
          <NumberInput
            aria-label="Смена"
            minValue={0}
            className="h-full w-full"
            value={salary?.salary || 0}
            onValueChange={value => updateData('value', value)}
          />
        </div>
        <div>
          <p>
            Переработка{' '}
            {salary?.calculatedOverWorkTime &&
              `(${salary?.calculatedOverWorkTime})`}
            :
          </p>
          <NumberInput
            aria-label="Переработка"
            minValue={0}
            className="h-full w-full"
            value={salary?.overWorkSalary || 0}
            onValueChange={value => {
              updateData('overwork', value)
            }}
          />
        </div>
        <div>
          <p>Бонусы/штрафы: {salary?.bonuses || 0}</p>
        </div>
      </div>
    </div>
  )
}
