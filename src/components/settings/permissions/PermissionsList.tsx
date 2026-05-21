'use client'

import type {FC} from 'react'
import {
  Avatar,
  Calendar,
  DateField,
  DatePicker,
  Label,
  ListBox,
  Select,
  Separator,
  Spinner,
  Switch,
} from '@heroui/react'
import {parseDate} from '@internationalized/date'
import type {CalendarDate, DateValue} from '@internationalized/date'
import {Icon} from '@iconify/react'
import type {
  DefaultPermission,
  Permission,
  WorkerBasic,
  WorkerPermission,
} from '@/src/utils/types'

interface PermissionsListProps {
  worker: WorkerBasic | null
  permissions: Permission[]
  workerPermissions: WorkerPermission[]
  isLoading: boolean
  onToggle: (permId: number, currentEnabled: boolean) => void
  onDateChange: (permId: number, date: CalendarDate | null) => void
  ranks: {id: number; name: string; weight: number}[]
  defaultPermissions: DefaultPermission[]
  onDefaultChange: (permId: number, rankId: number | null) => void
}

function ExpiryDatePicker({
  isDisabled,
  value,
  onChange,
}: {
  isDisabled: boolean
  value: CalendarDate | null
  onChange: (date: CalendarDate | null) => void
}) {
  return (
    <DatePicker
      isDisabled={isDisabled}
      value={value}
      onChange={(date: DateValue | null) =>
        onChange(date as CalendarDate | null)
      }
      aria-label="Срок действия">
      <DateField.Group variant="secondary" className="w-36">
        <DateField.Input>
          {segment => <DateField.Segment segment={segment} />}
        </DateField.Input>
        <DateField.Suffix>
          <DatePicker.Trigger>
            <DatePicker.TriggerIndicator />
          </DatePicker.Trigger>
        </DateField.Suffix>
      </DateField.Group>
      <DatePicker.Popover>
        <Calendar aria-label="Срок действия">
          <Calendar.Header>
            <Calendar.YearPickerTrigger>
              <Calendar.YearPickerTriggerHeading />
              <Calendar.YearPickerTriggerIndicator />
            </Calendar.YearPickerTrigger>
            <Calendar.NavButton slot="previous" />
            <Calendar.NavButton slot="next" />
          </Calendar.Header>
          <Calendar.Grid>
            <Calendar.GridHeader>
              {day => <Calendar.HeaderCell>{day}</Calendar.HeaderCell>}
            </Calendar.GridHeader>
            <Calendar.GridBody>
              {date => <Calendar.Cell date={date} />}
            </Calendar.GridBody>
          </Calendar.Grid>
          <Calendar.YearPickerGrid>
            <Calendar.YearPickerGridBody>
              {({year}) => <Calendar.YearPickerCell year={year} />}
            </Calendar.YearPickerGridBody>
          </Calendar.YearPickerGrid>
        </Calendar>
      </DatePicker.Popover>
    </DatePicker>
  )
}

function RankSelect({
  permId,
  ranks,
  defaultPerm,
  workerRankWeight,
  onChange,
}: {
  permId: number
  ranks: {id: number; name: string; weight: number}[]
  defaultPerm: DefaultPermission | undefined
  workerRankWeight: number | null
  onChange: (permId: number, rankId: number | null) => void
}) {
  const selectedKey = defaultPerm ? String(defaultPerm.rank_id) : 'none'
  const hasViaRank =
    defaultPerm != null &&
    workerRankWeight != null &&
    defaultPerm.rank_weight <= workerRankWeight

  return (
    <div className="flex shrink-0 items-center gap-2">
      {hasViaRank && (
        <span className="bg-success-soft text-success shrink-0 rounded px-1.5 py-0.5 text-xs font-medium">
          Ранг ✓
        </span>
      )}
      <Select
        selectedKey={selectedKey}
        onSelectionChange={key => {
          const k = key as string
          onChange(permId, k === 'none' ? null : parseInt(k))
        }}
        aria-label="Минимальный ранг"
        variant="secondary">
        <Label className="text-xs">С ранга</Label>
        <Select.Trigger className="h-8 min-w-28 text-xs">
          <Select.Value />
          <Select.Indicator />
        </Select.Trigger>
        <Select.Popover>
          <ListBox>
            <ListBox.Item id="none" textValue="—">
              <span className="text-default-400">—</span>
            </ListBox.Item>
            {ranks.map(r => (
              <ListBox.Item id={String(r.id)} key={r.id} textValue={r.name}>
                {r.name}
              </ListBox.Item>
            ))}
          </ListBox>
        </Select.Popover>
      </Select>
    </div>
  )
}

const PermissionsList: FC<PermissionsListProps> = ({
  worker,
  permissions,
  workerPermissions,
  isLoading,
  onToggle,
  onDateChange,
  ranks,
  defaultPermissions,
  onDefaultChange,
}) => {
  if (!worker) {
    return (
      <div className="text-default-400 flex h-full flex-col items-center justify-center gap-3">
        <Icon icon="lucide:shield" className="text-5xl opacity-40" />
        <p className="text-sm">Выберите сотрудника</p>
      </div>
    )
  }

  const getWorkerPerm = (permId: number) =>
    workerPermissions.find(wp => wp.permission_id === permId)

  const getDefaultPerm = (permId: number) =>
    defaultPermissions.find(dp => dp.permission_id === permId)

  return (
    <div className="bg-surface relative flex h-full w-full flex-col overflow-y-auto rounded-3xl">
      <div className="bg-surface border-divider sticky top-0 z-100 flex shrink-0 items-center gap-4 border-b px-6 py-4">
        <Avatar size="md">
          <Avatar.Image src={worker.photoUrl || ''} />
          <Avatar.Fallback>{worker.name.slice(0, 2)}</Avatar.Fallback>
        </Avatar>
        <div>
          <p className="text-foreground font-semibold">{worker.name}</p>
          <p className="text-default-400 text-sm">{worker.rank ?? ''}</p>
        </div>
      </div>

      <div className="flex-1">
        {isLoading ? (
          <div className="flex h-32 items-center justify-center">
            <Spinner size="md" />
          </div>
        ) : (
          <div className="divide-divider flex flex-col divide-y">
            {permissions.map(perm => {
              const wp = getWorkerPerm(perm.id)
              const enabled = !!wp
              const expiresDate = wp?.expires
                ? parseDate(wp.expires.slice(0, 10))
                : null
              const defaultPerm = getDefaultPerm(perm.id)

              return (
                <div
                  key={perm.id}
                  className="flex flex-wrap items-center gap-x-4 gap-y-2 px-6 py-4">
                  <div className="min-w-0 flex-1">
                    <p className="text-foreground text-sm font-semibold">
                      {perm.description}
                    </p>
                    <p className="text-default-500 mt-0.5 text-xs">
                      {perm.name}
                    </p>
                  </div>

                  <div className="flex shrink-0 items-center gap-3">
                    <RankSelect
                      permId={perm.id}
                      ranks={ranks}
                      defaultPerm={defaultPerm}
                      workerRankWeight={worker.rankWeight}
                      onChange={onDefaultChange}
                    />

                    <Separator orientation="vertical" />

                    <ExpiryDatePicker
                      isDisabled={!enabled}
                      value={expiresDate}
                      onChange={date => onDateChange(perm.id, date)}
                    />

                    <Switch
                      isSelected={enabled}
                      onChange={val => onToggle(perm.id, !val)}
                      size="md"
                      className="shrink-0">
                      <Switch.Control>
                        <Switch.Thumb />
                      </Switch.Control>
                    </Switch>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

export default PermissionsList
