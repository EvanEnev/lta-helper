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
} from '@heroui/react'
import {
  ListBox,
  Select,
  NumberField,
  Label,
  Accordion,
  Input,
  Key,
  Checkbox,
  Description,
  TextField,
  TextArea,
} from '@heroui/react-beta'
import {Activity, useCallback, useMemo, useState} from 'react'
import groupBy from '@/lib/functions/groupBy'
import RankIcon from '@/src/components/global/RankIcon'
import {evaluate} from 'mathjs'
import LocationSelect from '@/src/components/global/LocationSelect'
import FormulaInput from '@/src/components/global/FormulaInput'
import {DateTime} from 'luxon'
import {withMask} from 'use-mask-input'
import {Icon} from '@iconify/react'

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
  const [selectedKeys, setSelectedKeys] = useState<
    Key | Key[] | null | undefined
  >()
  const worker = workers.find(
    (worker: {name: string}) =>
      worker.name?.toLowerCase() === data.worker?.toLowerCase(),
  )

  const location = useMemo(() => {
    return locations.find(l => l.name === data.location)
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

    if (faceIdResult?.length && faceIdResult?.length >= 2) {
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

  const isTyped = useMemo(() => data.location === 'Другое', [data.location])

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
        value: isTyped ? (data.value ? data.value : 0) : data.value,
        overwork: isTyped ? 0 : data.overwork,
        oneGames: data.oneGames?.value,
        twoGames: data.twoGames?.value,
        threeGames: data.threeGames?.value,
        actorGames: data.actorGames?.value,
      },
    })
  }, [
    isTyped,
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

  const accordionTitle = useMemo(() => {
    const keys = ['oneGames', 'twoGames', 'threeGames', 'actorGames']

    const summary = keys.reduce(
      // @ts-ignore
      (acc, key) => acc + (data[key]?.value || (salary ? salary[key] : 0)),
      0,
    )

    return `Игры ${summary ? `(${summary})` : ''}`
  }, [data, salary])

  const filteredGamesTypes = useMemo(() => {
    if (worker?.rank === 'Актёр') {
      return gamesPayments.filter(d => d.rank === 12)
    } else {
      return gamesPayments.filter(d => d.rank !== 12)
    }
  }, [worker?.rank, gamesPayments])

  return (
    <div className="flex h-full w-[300px] flex-col gap-2 overflow-y-hidden">
      <Autocomplete
        isRequired
        label="Сотрудник"
        labelPlacement="outside"
        isClearable={false}
        description={
          <div className="flex justify-between">
            <p>
              Вход:{' '}
              {faceIdData && faceIdData[0] ? faceIdData[0]?.date : <i>Нет</i>}
            </p>
            <p>
              Выход:{' '}
              {faceIdData && faceIdData[1] ? faceIdData[1]?.date : <i>Нет</i>}
            </p>
          </div>
        }
        startContent={
          <RankIcon
            className="h-6"
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
              <RankIcon rank={key} className="h-6" /> {key}
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
        callback={value => updateData('location', (value as LTLocation)?.name)}
        locationId={location?.id || -1}
      />
      <Select
        variant="secondary"
        isRequired
        selectionMode={isTyped ? 'single' : 'multiple'}
        value={selectedKeys}
        onChange={value => {
          setSelectedKeys(value || [])
          updateData(
            isTyped ? 'type' : 'workTypes',
            isTyped ? value : [...(value as Key[])],
          )
        }}
        className="">
        <Label>{isTyped ? 'Тип' : 'Тип работы'}</Label>
        <Select.Trigger className="truncate">
          <Select.Value />
          <Select.Indicator />
        </Select.Trigger>
        <Select.Popover>
          <ListBox selectionMode={isTyped ? 'single' : 'multiple'}>
            {isTyped
              ? types.map(type => (
                  <ListBox.Item key={type} id={type}>
                    {type}
                    <ListBox.ItemIndicator />
                  </ListBox.Item>
                ))
              : workTypes.map(type => (
                  <ListBox.Item
                    key={type.id}
                    id={type.id}
                    textValue={type.name}>
                    {type.name}
                    <ListBox.ItemIndicator />
                  </ListBox.Item>
                ))}
          </ListBox>
        </Select.Popover>
      </Select>
      {!isTyped && (
        <TextField isRequired className="">
          <Label htmlFor="workingHours">Время работы</Label>
          <Input
            placeholder="__-__"
            ref={withMask('99-99', {inputmode: 'numeric', placeholder: '_'})}
            variant="secondary"
            id="workingHours"
            required
            value={data.workingHours}
            className={data.type ? 'hidden' : 'col-1'}
            onChange={e => updateData('workingHours', e.target.value)}
          />
        </TextField>
      )}
      <div className="flex w-full justify-between gap-2">
        <NumberField
          variant="secondary"
          isWheelDisabled
          className="h-full w-fit min-w-0"
          minValue={0}
          value={salary?.value}
          onChange={value => updateData('value', value)}>
          <Label>Смена</Label>
          <NumberField.Group className="h-full w-fit min-w-0">
            <NumberField.Input className="w-full" />
          </NumberField.Group>
          <Activity
            mode={
              salary?.start_time && salary?.end_time ? 'visible' : 'hidden'
            }>
            {!isTyped && (
              <Description>
                {salary?.start_time}-{salary?.end_time}
              </Description>
            )}
          </Activity>
        </NumberField>
        {!isTyped && (
          <NumberField
            variant="secondary"
            isWheelDisabled
            className="h-full w-fit min-w-0"
            minValue={0}
            value={salary?.overwork}
            onChange={value => updateData('overwork', value)}>
            <Label>Переработка</Label>
            <NumberField.Group className="h-full w-fit min-w-0">
              <NumberField.Input className="w-full" />
            </NumberField.Group>
          </NumberField>
        )}
      </div>
      <div className="flex justify-between gap-2">
        <FormulaInput
          labelPlacement="outside"
          className="col-2"
          label="Бонусы"
          description={evaluate(data.bonuses || '')}
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
          description={evaluate(data.fines || '')}
          value={data.fines}
          callback={({text, error}) => {
            if (!error) {
              updateData('fines', text)
            }
          }}
        />
      </div>
      {!isTyped && worker?.rank !== 'Актёр' && (
        <Checkbox
          variant="secondary"
          onChange={value => updateData('isHardTime', value)}
          className="col-1 [&_[data-slot='checkbox-default-indicator--checkmark']]:size-4">
          <Checkbox.Control className="size-5">
            <Checkbox.Indicator />
          </Checkbox.Control>
          <Checkbox.Content>
            <Label>Загруз</Label>
          </Checkbox.Content>
        </Checkbox>
      )}
      {!isTyped && worker?.rank === 'Железный' && (
        <Checkbox
          variant="secondary"
          onChange={value => updateData('hasGames', value)}
          className="col-1 [&_[data-slot='checkbox-default-indicator--checkmark']]:size-4">
          <Checkbox.Control className="size-5">
            <Checkbox.Indicator />
          </Checkbox.Control>
          <Checkbox.Content>
            <Label>Есть игры</Label>
          </Checkbox.Content>
        </Checkbox>
      )}
      {data.type && data.location === 'Другое' && (
        <Checkbox
          variant="secondary"
          onChange={value => updateData('withoutDate', value)}
          className="col-1 [&_[data-slot='checkbox-default-indicator--checkmark']]:size-4">
          <Checkbox.Control className="size-5">
            <Checkbox.Indicator />
          </Checkbox.Control>
          <Checkbox.Content>
            <Label>Без даты</Label>
          </Checkbox.Content>
        </Checkbox>
      )}
      {!isTyped && (
        <Accordion className="mt-auto px-0">
          <Accordion.Item>
            <Accordion.Heading>
              <Accordion.Trigger className="border-default-300 hover:bg-default-200 mt-auto flex cursor-pointer justify-start gap-2 rounded-t-xl border-b-1 transition-colors duration-200">
                <Icon icon="solar:gamepad-bold" width="24" height="24" />{' '}
                {accordionTitle}
                <Accordion.Indicator>
                  <Icon
                    icon="solar:alt-arrow-down-linear"
                    width="24"
                    height="24"
                  />
                </Accordion.Indicator>
              </Accordion.Trigger>
            </Accordion.Heading>
            <Accordion.Panel className="pt-2">
              <Accordion.Body className="flex w-full grid-flow-row-dense auto-rows-fr grid-cols-2 flex-col gap-2">
                {filteredGamesTypes.map((d, index) => {
                  return (
                    <div className="flex gap-2" key={index}>
                      <NumberField
                        variant="secondary"
                        className="col-1 w-fit"
                        minValue={0}
                        isWheelDisabled
                        // @ts-ignore
                        value={data[d.key]?.number}
                        onChange={value => {
                          // @ts-ignore
                          const existingData = data[d.key]

                          // @ts-ignore
                          updateData(d.key, {
                            id: d.id,
                            number:
                              existingData?.number === undefined ? 1 : value,
                          })
                        }}>
                        <Label>{d.description}</Label>
                        <NumberField.Group className="h-full w-fit min-w-0">
                          <NumberField.DecrementButton />
                          <NumberField.Input placeholder="0" className="w-20" />
                          <NumberField.IncrementButton />
                        </NumberField.Group>
                      </NumberField>
                      <NumberField
                        variant="secondary"
                        isWheelDisabled
                        minValue={0}
                        className="h-full w-fit"
                        value={
                          // @ts-ignore
                          data[d.key]?.value ||
                          // @ts-ignore
                          (salary ? salary[d.key] : undefined)
                        }
                        onChange={value => {
                          // @ts-ignore
                          const existingData = data[d.key]
                          if (!existingData) return
                          // @ts-ignore
                          updateData(d.key, {
                            id: existingData.id,
                            number: existingData.number,
                            value,
                          })
                        }}>
                        <Label>Результат</Label>
                        <NumberField.Group className="h-full w-fit min-w-0">
                          <NumberField.Input
                            placeholder="0"
                            className="w-full"
                          />
                        </NumberField.Group>
                      </NumberField>
                    </div>
                  )
                })}
              </Accordion.Body>
            </Accordion.Panel>
          </Accordion.Item>
        </Accordion>
      )}
      <TextField
        variant="secondary"
        className="col-2 row-span-2"
        value={data.comment}
        onChange={value => updateData('comment', value)}>
        <Label>Комментарий</Label>
        <TextArea />
      </TextField>
    </div>
  )
}
