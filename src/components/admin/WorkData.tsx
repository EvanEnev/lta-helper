import locations from "@/src/utils/locations";
import { WorkerSalary, Worker } from "@/src/utils/types";
import { Autocomplete, AutocompleteItem, Checkbox, Input, Textarea } from "@nextui-org/react";
import { Key } from "react";

type WorkDataProps = {
    data: WorkerSalary,
    setData: any,
    workers: any[],
    index: number
}
export default function WorkData({data, setData, workers, index}: WorkDataProps) {
  const worker = workers.find((worker: { name: string; }) => worker.name?.toLowerCase() === data.worker?.toLowerCase())

    const updateData = (key: 'worker' | 'location' | 'workingHours' | 'bonuses' | 'comment' | 'isHardTime' | 'gamesCount', value: Key | string | boolean | null) => {
        const currentData = {...data}

        if(!value) return

        // @ts-ignore
        currentData[key] = value

        setData((prev: WorkerSalary[]) => {
            const newData = [...prev]
            newData[index] = currentData

            return newData
        })
    }

    const validate = (value: string) => {
      if (parseInt(value) < 0) {
        return 'Число не должно быть отрицательным'
      }

      return null
    }

    return <div className='flex flex-col gap-4'>
        <Autocomplete
        isRequired
        label="Сотрудник"
        selectedKey={data.worker}
        onSelectionChange={(value) => updateData('worker', value)}>
        {workers.map((worker: any) => (
          <AutocompleteItem key={worker.name}>{worker.name}</AutocompleteItem>
        ))}
      </Autocomplete>
      <Autocomplete
        isRequired
        label="Локация"
        selectedKey={data.location}
        onSelectionChange={(value) => updateData('location', value)}>
        {locations.map((location: string) => (
          <AutocompleteItem key={location}>{location}</AutocompleteItem>
        ))}
      </Autocomplete>
      <Input
        isRequired
        label="Время работы"
        value={data.workingHours}
        onValueChange={(value) => updateData('workingHours', value)}
      />
      {worker?.rank === 'Актёр' ? <Input label="Кол-во игр" type="number" validate={validate} value={data.gamesCount.toString()} onValueChange={(value) => updateData('gamesCount', value)}/> : <Checkbox onValueChange={value => (updateData('isHardTime', value))}>Загруз</Checkbox>}
      <Input label="Бонусы/штрафы" value={data.bonuses} onValueChange={(value) => updateData('bonuses', value)} />
      <Textarea label="Комментарий" value={data.comment} onValueChange={(value) => updateData('comment', value)} />
      </div>
}