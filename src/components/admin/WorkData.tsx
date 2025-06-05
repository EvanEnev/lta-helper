import getSalaryData from '@/src/utils/admin/getSalaryData'
import locations from '@/src/utils/locations'
import {LTWorker, WorkerSalary} from '@/src/utils/types'
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
import {Key, useMemo} from 'react'
import groupBy from '@/lib/functions/groupBy'
import RankIcon from '@/src/components/global/RankIcon'

type WorkDataProps = {
  data: WorkerSalary
  setData: any
  workers: any[]
  index: number
}

export default function WorkData({
  data,
  setData,
  workers,
  index,
}: WorkDataProps) {
  const worker = workers.find(
    (worker: {name: string}) =>
      worker.name?.toLowerCase() === data.worker?.toLowerCase(),
  )

  const updateData = (
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
      | 'fines',
    value: Key | string | boolean | null,
  ) => {
    const currentData = {...data}

    // @ts-ignore
    currentData[key] = value

    setData((prev: WorkerSalary[]) => {
      const newData = [...prev]
      newData[index] = currentData

      return newData
    })
  }

  const validate = (value: number) => {
    if (value <= 0) {
      return 'Число должно быть положительным'
    }

    return null
  }

  const salary = useMemo(
    () =>
      getSalaryData({
        worker: data.worker,
        rank: (worker?.rank as string) || 'актёр',
        workingHours: data.workingHours,
        isHardTime: data.isHardTime,
        gamesCount: data.gamesCount,
        comment: data.comment,
        bonuses: data.bonuses,
        value: data.value,
        fines: data.fines,
      }),
    [
      data.worker,
      data.workingHours,
      data.isHardTime,
      data.gamesCount,
      data.comment,
      data.bonuses,
      worker?.rank,
      data.value,
    ],
  )

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
        {locations.map((location: string) => (
          <AutocompleteItem key={location}>{location}</AutocompleteItem>
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
        value={data.bonuses}
        onValueChange={value => updateData('fines', value)}
      />
      <Textarea
        label="Комментарий"
        value={data.comment}
        onValueChange={value => updateData('comment', value)}
      />
      <Divider />
      <div className="flex flex-col gap-2">
        <div className="">
          <p>
            Смена{' '}
            {salary?.calculatedWorkingTime &&
              `(${salary?.calculatedWorkingTime})`}
            :
          </p>
          <NumberInput
            minValue={0}
            className="h-full w-full"
            value={salary?.salary || 0}
            onValueChange={value => updateData('value', value)}
          />{' '}
        </div>
        <div>
          <p>
            Переработка: {salary?.overWorkSalary || 0}{' '}
            {salary?.calculatedOverWorkTime && (
              <>({salary?.calculatedOverWorkTime})</>
            )}
          </p>
        </div>
        <div>
          <p>Бонусы/штрафы: {salary?.bonuses || 0}</p>
        </div>
      </div>
    </div>
  )
}
