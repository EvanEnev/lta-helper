import getSalaryData from '@/src/utils/admin/getSalaryData'
import locations from '@/src/utils/locations'
import {WorkerSalary} from '@/src/utils/types'
import {
  Autocomplete,
  AutocompleteItem,
  Checkbox,
  Divider,
  Input,
  NumberInput,
  Textarea,
} from '@heroui/react'
import {Key, useMemo} from 'react'

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
        fines: data.fines,
        isHardTime: data.isHardTime,
        gamesCount: data.gamesCount,
        comment: data.comment,
        bonuses: data.bonuses,
      }),
    [
      data.worker,
      data.workingHours,
      data.isHardTime,
      data.gamesCount,
      data.comment,
      data.bonuses,
      data.fines,
      worker?.rank,
    ],
  )

  return (
    <div className="flex w-full flex-col gap-4">
      <Autocomplete
        isRequired
        label="Сотрудник"
        selectedKey={data.worker}
        onSelectionChange={value => updateData('worker', value)}>
        {workers.map((worker: any) => (
          <AutocompleteItem key={worker.name}>{worker.name}</AutocompleteItem>
        ))}
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
          Есть игры?
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
          Загруз?
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
            Смена: {salary?.salary || 0}{' '}
            {salary?.calculatedWorkingTime && (
              <>({salary?.calculatedWorkingTime})</>
            )}
          </p>
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
