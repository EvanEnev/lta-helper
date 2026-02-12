import {Input, Label, ListBox, Select, TextField} from '@heroui/react-beta'
import {Icon} from '@iconify/react'
import {semanticColors} from '@heroui/react'
import LocationSelect from '@/src/components/global/LocationSelect'
import {LTLocation} from '@/src/utils/types'
import unaccent from '@/lib/functions/unaccent'

interface PayrollsDetailsHeaderProps {
  theme: string
  filterChangeCallback: (
    filter: string,
    value: string | number | LTLocation | null,
  ) => void
}

export default function PayrollsDetailsHeader({
  theme,
  filterChangeCallback,
}: PayrollsDetailsHeaderProps) {
  return (
    <div className="scrolled bg-content1 sticky top-2 z-1000 flex w-full flex-wrap items-center gap-2 rounded-2xl p-3 text-xl font-bold">
      <Input
        onChange={e =>
          filterChangeCallback(
            'name',
            unaccent(e.currentTarget.value.toLowerCase()),
          )
        }
        variant="secondary"
        placeholder="Позывной"
      />
      <Select
        variant="secondary"
        placeholder="Статус"
        onChange={v => {
          console.debug(v)
          filterChangeCallback('status', v)
        }}>
        <Select.Trigger>
          <Select.Value />
          <Select.Indicator />
        </Select.Trigger>
        <Select.Popover>
          <ListBox>
            <ListBox.Item id={0}>
              <Label className="flex gap-2">
                <Icon
                  icon="solar:menu-dots-circle-bold"
                  width="24"
                  height="24"
                />
                Все
              </Label>
              <ListBox.ItemIndicator />
            </ListBox.Item>
            <ListBox.Item id={1}>
              <Label className="flex gap-2">
                <Icon
                  icon="solar:close-circle-bold"
                  width="24"
                  height="24"
                  // @ts-ignore
                  style={{color: semanticColors[theme].default['500']}}
                />
                Без статуса
              </Label>
              <ListBox.ItemIndicator />
            </ListBox.Item>
            <ListBox.Item id={2}>
              <Label className="flex gap-2">
                <Icon
                  icon="solar:danger-circle-bold"
                  width="24"
                  height="24"
                  // @ts-ignore
                  style={{color: semanticColors[theme].primary['500']}}
                />
                Подтверждено
              </Label>
              <ListBox.ItemIndicator />
            </ListBox.Item>
            <ListBox.Item id={3}>
              <Label className="flex gap-2">
                <Icon
                  icon="solar:check-circle-bold"
                  width="24"
                  height="24"
                  // @ts-ignore
                  style={{color: semanticColors[theme].success['500']}}
                />
                Выдано
              </Label>
              <ListBox.ItemIndicator />
            </ListBox.Item>
          </ListBox>
        </Select.Popover>
      </Select>
      <LocationSelect
        includeAll
        placeholder="Локация"
        showLabel={false}
        callback={l => filterChangeCallback('location', l?.id === 0 ? null : l)}
        locationId={-1}
      />
    </div>
  )
}
