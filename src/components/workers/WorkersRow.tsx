import {
  LTRank,
  LTWorker,
  LTWorkerData,
  RankRequirement,
  RankUpdateData,
} from '@/src/utils/types'
import {
  Avatar,
  Button,
  Separator,
  Popover,
  Checkbox,
  NumberField,
  ProgressBar,
  Label,
  Modal,
  TextField,
  Input,
  FieldError,
  ListBox,
  Form,
  Select,
} from '@heroui/react'
import RankIcon from '@/src/components/global/RankIcon'
import formatPhone from '@/lib/functions/formatPhone'
import {Icon} from '@iconify/react'
import {Activity, FormEvent, Fragment, useMemo} from 'react'
import groupBy from '@/lib/functions/groupBy'
import {withMask} from 'use-mask-input'

interface WorkersRowProps {
  worker: LTWorker
  ranks: LTRank[]
  data: LTWorkerData
  maxRankId: number
  minRankId: number
  canEdit: boolean
  updateCallback: (data: {
    requirementId: number
    workerId: number
    value: number | null
    toDelete: boolean
    meta: RankUpdateData['meta']
  }) => void
  updateWorkerRank: (
    workerId: number,
    type: 'promote' | 'demote',
  ) => Promise<void>
  approveCallback: (
    e: FormEvent<HTMLFormElement>,
    workerId: number,
  ) => Promise<void>
}

export default function WorkersRow({
  worker,
  ranks,
  data,
  maxRankId,
  minRankId,
  canEdit,
  updateCallback,
  updateWorkerRank,
  approveCallback,
}: WorkersRowProps) {
  const categories = useMemo(
    () =>
      Array.from(
        new Set(data.rankData.filter(d => !!d.category).map(d => d.category)),
      ),
    [data.rankData],
  )

  const groupedCategories = useMemo(() => {
    if (categories.length === 0) return {}

    return groupBy(
      data.rankData.filter(d => !!d.category),
      'category',
    )
  }, [categories.length, data.rankData])

  const done = useMemo(() => {
    const withoutCategories = data.rankData
      .filter(d => !d.category && !d.meta?.isChoice)
      .every(d => (d.type === 'check' ? d.done : d.value! >= d.limit!))

    const choices = data.rankData.filter(d => d.meta?.isChoice)

    return (
      withoutCategories &&
      (Object.values(groupedCategories).length
        ? // @ts-ignore
          Object.values(groupedCategories).some((c: RankRequirement[]) =>
            c.every(d => (d.type === 'check' ? d.done : d.value! >= d.limit!)),
          )
        : true) &&
      choices.some(d => (d.type === 'check' ? d.done : d.value! >= d.limit!))
    )
  }, [data.rankData, groupedCategories])

  return (
    <div
      className={`bg-surface z-1000 flex items-center gap-2 rounded-2xl px-4 py-2 ${data.isApproved ? '' : 'border-danger border'} `}>
      <div className="flex w-20 flex-col gap-2 wrap-anywhere">
        <Avatar>
          <Avatar.Image src={data.photoUrl || ''} />
          <Avatar.Fallback>{data.name.slice(0, 2)}</Avatar.Fallback>
        </Avatar>
        <p>{data.name}</p>
      </div>
      <Separator orientation="vertical" className="bg-surface-foreground/50" />
      <div
        className={`flex ${canEdit ? 'w-60 justify-between' : 'w-25 justify-center'} items-center gap-2`}>
        <div className="flex flex-col items-center gap-2">
          <RankIcon rank={data.rank.name} />
          <p>{data.rank.name}</p>
          {data.isFormer && <i>Бывший</i>}
        </div>
        <Activity mode={canEdit ? 'visible' : 'hidden'}>
          <div className="flex flex-col gap-2">
            <Button
              onPress={() => updateWorkerRank(data.id, 'promote')}
              className="w-full"
              variant="secondary"
              isDisabled={data.rank.id === maxRankId}>
              <Icon icon="solar:arrow-up-linear" width="24" height="24" />
              Повысить
            </Button>
            <Button
              onPress={() => updateWorkerRank(data.id, 'demote')}
              className="w-full"
              variant="danger-soft"
              isDisabled={data.rank.id === minRankId}>
              <Icon icon="solar:arrow-down-linear" width="24" height="24" />
              Понизить
            </Button>
          </div>
        </Activity>
      </div>
      <Separator orientation="vertical" className="bg-surface-foreground/50" />
      <div className="w-40 wrap-break-word">
        <p>
          {data.lastName} {data.firstName} {data.middleName}
        </p>
      </div>
      <Separator orientation="vertical" className="bg-surface-foreground/50" />
      <div className="flex w-60 flex-col flex-wrap gap-2">
        <div className="border-surface-foreground/50 flex items-center gap-2 rounded-2xl border-2 p-1">
          <Icon icon="solar:phone-bold" width="24" height="24" />
          <a href={`tel:${data.phoneNumber}`}>
            {formatPhone(data.phoneNumber || '')}
          </a>
          <Button
            variant="ghost"
            isIconOnly
            onPress={() =>
              navigator.clipboard.writeText(data.phoneNumber || '')
            }>
            <Icon icon="solar:clipboard-bold" width="24" height="24" />
          </Button>
        </div>
        <a
          className="border-accent hover:bg-accent flex items-center gap-2 rounded-2xl border-2 p-1 transition-colors"
          target="_blank"
          href={`tg://user?id=${data.telegramId}`}>
          <Icon icon="ic:baseline-telegram" width={24} height={24} />
          Открыть в Telegram
        </a>
      </div>
      {data.rankData?.length > 0 && (
        <>
          <Separator
            orientation="vertical"
            className="bg-surface-foreground/50"
          />
          <div className="flex gap-2">
            <ProgressBar
              color={done ? 'success' : 'default'}
              value={
                data.rankData.length
                  ? data.rankData.reduce(
                      (acc, cur) => (cur.done ? acc + 1 : acc),
                      0,
                    )
                  : 0
              }
              formatOptions={{style: 'percent'}}
              maxValue={data.rankData.length || undefined}>
              <Label>Прогресс</Label>
              <ProgressBar.Output />
              <ProgressBar.Track>
                <ProgressBar.Fill />
              </ProgressBar.Track>
            </ProgressBar>
            <Popover>
              <Button variant="outline">Подробнее</Button>
              <Popover.Content placement="right">
                <Popover.Arrow />
                <Popover.Dialog className="flex flex-col justify-center gap-2">
                  {data.rankData
                    .filter(d => !d.category)
                    .map((req, index) => {
                      return (
                        <Fragment key={req.id}>
                          <div className="flex items-center gap-2">
                            {req.type === 'check' && (
                              <Checkbox
                                className="w-full"
                                isReadOnly={!canEdit}
                                defaultSelected={req.done}
                                onChange={v =>
                                  updateCallback({
                                    requirementId: req.id,
                                    workerId: data.id,
                                    value: null,
                                    toDelete: !v,
                                    meta: req.meta,
                                  })
                                }
                                variant="secondary">
                                <Checkbox.Control>
                                  <Checkbox.Indicator />
                                </Checkbox.Control>
                                <p>{req.name}</p>
                              </Checkbox>
                            )}
                            {req.type === 'number' && (
                              <>
                                <NumberField
                                  isReadOnly={!canEdit}
                                  defaultValue={req.value || undefined}
                                  variant="secondary"
                                  minValue={0}
                                  onChange={v =>
                                    updateCallback({
                                      requirementId: req.id,
                                      workerId: data.id,
                                      value: v,
                                      toDelete: !v,
                                      meta: req.meta,
                                    })
                                  }>
                                  <NumberField.Group>
                                    <NumberField.DecrementButton />
                                    <div className="flex items-center gap-2 px-2">
                                      <NumberField.Input
                                        className="mr-0 w-8 pr-0"
                                        placeholder="0"
                                      />
                                      <span>/ {req.limit!}</span>
                                    </div>
                                    <NumberField.IncrementButton />
                                  </NumberField.Group>
                                </NumberField>
                                <p>{req.name}</p>
                              </>
                            )}
                          </div>
                          {index !== data.rankData.length - 1 && (
                            <Separator className="bg-surface-foreground/50" />
                          )}
                        </Fragment>
                      )
                    })}
                  {categories.length !== 0 && (
                    <div
                      style={{
                        gridTemplateColumns: `${new Array(categories.length)
                          .fill(0)
                          .map(_ => '1fr')
                          .join(' auto ')}`,
                      }}
                      className="grid auto-rows-min gap-2">
                      {Object.keys(groupedCategories).map((key, index) => {
                        const groupData = groupedCategories[key]

                        return (
                          <Fragment key={key}>
                            <div className="flex flex-col gap-2">
                              <p className="col-span-full mb-2 font-bold">
                                {key}
                              </p>
                              {groupData.map(
                                (req: RankRequirement, index: number) => (
                                  <Fragment key={req.id}>
                                    <div className="flex gap-2">
                                      {req.type === 'check' && (
                                        <Checkbox
                                          className="w-full"
                                          isReadOnly={!canEdit}
                                          defaultSelected={req.done}
                                          onChange={v =>
                                            updateCallback({
                                              requirementId: req.id,
                                              workerId: data.id,
                                              value: null,
                                              toDelete: !v,
                                              meta: req.meta,
                                            })
                                          }
                                          variant="secondary">
                                          <Checkbox.Control>
                                            <Checkbox.Indicator />
                                          </Checkbox.Control>
                                          <p>{req.name}</p>
                                        </Checkbox>
                                      )}
                                      {req.type === 'number' && (
                                        <>
                                          <NumberField
                                            isReadOnly={!canEdit}
                                            defaultValue={req.value || 0}
                                            variant="secondary"
                                            minValue={0}
                                            onChange={v =>
                                              updateCallback({
                                                requirementId: req.id,
                                                workerId: data.id,
                                                value: v,
                                                toDelete: !v,
                                                meta: req.meta,
                                              })
                                            }>
                                            <NumberField.Group>
                                              <NumberField.DecrementButton />
                                              <div className="flex items-center gap-2 px-2">
                                                <NumberField.Input
                                                  className="mr-0 w-8 pr-0"
                                                  placeholder="0"
                                                />
                                                <span>/ {req.limit!}</span>
                                              </div>
                                              <NumberField.IncrementButton />
                                            </NumberField.Group>
                                          </NumberField>
                                          <p>{req.name}</p>
                                        </>
                                      )}
                                    </div>
                                    {index !== groupData.length - 1 && (
                                      <Separator className="bg-surface-foreground/50" />
                                    )}
                                  </Fragment>
                                ),
                              )}
                            </div>
                            {index !==
                              Object.keys(groupedCategories).length - 1 && (
                              <Separator
                                orientation="vertical"
                                className="bg-surface-foreground/50"
                              />
                            )}
                          </Fragment>
                        )
                      })}
                    </div>
                  )}
                </Popover.Dialog>
              </Popover.Content>
            </Popover>
          </div>
        </>
      )}
      <div>{data.quests.map(d => d.name).join(', ')}</div>
      <div>{data.generations.map(d => d.name).join(', ')}</div>
      <Activity mode={data.invitedBy === worker.id ? 'visible' : 'hidden'}>
        <Modal>
          <Button>Подтвердить</Button>
          <Modal.Backdrop className="z-10000">
            <Modal.Container>
              <Modal.Dialog>
                <Modal.CloseTrigger />
                <Modal.Body className="p-2">
                  <Form
                    id="form"
                    className="flex w-full flex-col gap-2"
                    onSubmit={async e => {
                      await approveCallback(e, data.id)
                    }}>
                    <TextField
                      variant="secondary"
                      isRequired
                      defaultValue={data?.name}>
                      <Label>Позывной</Label>
                      <Input name="name" />
                      <FieldError>Поле обязательно</FieldError>
                    </TextField>
                    <TextField
                      variant="secondary"
                      isRequired
                      defaultValue={data?.lastName || undefined}>
                      <Label>Фамилия</Label>
                      <Input name="last_name" />
                      <FieldError>Поле обязательно</FieldError>
                    </TextField>
                    <TextField
                      variant="secondary"
                      isRequired
                      defaultValue={data?.firstName || undefined}>
                      <Label>Имя</Label>
                      <Input name="first_name" />
                      <FieldError>Поле обязательно</FieldError>
                    </TextField>
                    <TextField
                      variant="secondary"
                      isRequired
                      defaultValue={data?.middleName || undefined}>
                      <Label>Отчество</Label>
                      <Input name="middle_name" />
                    </TextField>
                    <TextField
                      variant="secondary"
                      type="tel"
                      isRequired
                      defaultValue={data?.phoneNumber || undefined}>
                      <Label>Номер телефона</Label>
                      <Input
                        placeholder="+7 ___ ___-__-__"
                        ref={withMask('+7 999 999-99-99', {
                          inputmode: 'numeric',
                          placeholder: '_',
                        })}
                        name="phone"
                      />
                      <FieldError>Поле обязательно</FieldError>
                    </TextField>
                    <TextField
                      variant="secondary"
                      type="email"
                      isRequired
                      defaultValue={data?.email || undefined}>
                      <Label>Google почта</Label>
                      <Input name="email" />
                      <FieldError>Неверная почта</FieldError>
                    </TextField>
                    <Select
                      name="rank_id"
                      isRequired
                      className="w-full"
                      variant="secondary"
                      selectionMode="single"
                      // @ts-ignore
                      defaultValue={[data.rank.id]}>
                      <Label>Ранг</Label>
                      <Select.Trigger>
                        <Select.Value className="truncate" />
                        <Select.Indicator />
                      </Select.Trigger>
                      <Select.Popover>
                        <ListBox>
                          {ranks.map(rank => (
                            <ListBox.Item
                              textValue={rank.name}
                              key={rank.name}
                              id={rank.id}>
                              <Label>{rank.name}</Label>
                              <ListBox.ItemIndicator />
                            </ListBox.Item>
                          ))}
                        </ListBox>
                      </Select.Popover>
                    </Select>
                  </Form>
                </Modal.Body>
                <Modal.Footer>
                  <Button slot="close" variant="secondary">
                    Закрыть
                  </Button>
                  <Button form="form" slot="close" type="submit">
                    Подтвердить
                  </Button>
                </Modal.Footer>
              </Modal.Dialog>
            </Modal.Container>
          </Modal.Backdrop>
        </Modal>
      </Activity>
    </div>
  )
}
