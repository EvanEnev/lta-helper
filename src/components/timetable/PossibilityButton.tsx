import {LTLocation, PossibilityData} from '@/src/utils/types'
import {
  Button,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
} from '@heroui/react'
import Location from '@/src/components/global/Location'
import isDark from '@/lib/functions/isDark'
import {useTheme} from 'next-themes'
import {useState} from 'react'

interface PossibilityButtonProps {
  data: PossibilityData
  locations: LTLocation[]
  callback: (key: string) => void
}

export default function PossibilityButton({
  data,
  locations,
  callback,
}: PossibilityButtonProps) {
  const {theme} = useTheme()
  const [hovered, setHovered] = useState<string>('')
  if (!data) return null

  const values: {name: string; key: string; color: string}[] = [
    {name: 'Могу', key: '+', color: 'success'},
    {name: 'Не могу', key: '-', color: 'danger'},
    {name: 'Могу с огр-ем', key: '+/-', color: 'warning'},
    ...locations.map(l => ({name: l.name, key: l.name, color: l.color})),
  ]

  const location = locations.find(l => l.name === data.value)
  const value = values.find(d => d.key === data.value)

  const getTextColorClasses = (color: string) =>
    theme === 'dark'
      ? isDark(color)
        ? 'text-default-100! [&>div>hr[role=separator]]:bg-default-100'
        : 'text-foreground! [&>div>hr[role=separator]]:bg-foreground'
      : isDark(color)
        ? 'text-foreground! [&>div>hr[role=separator]]:bg-foreground'
        : 'text-default-100! [&>div>hr[role=separator]]:bg-default-100'

  return (
    <Dropdown>
      <DropdownTrigger>
        {location ? (
          <Button
            className={`min-h-fit w-full p-2 ${getTextColorClasses(location.color)}`}
            style={{backgroundColor: location.color}}>
            <Location locationName={location.name} />
          </Button>
        ) : (
          <Button
            className="min-h-fit w-full p-2"
            color={
              (value?.color as 'danger' | 'warning' | 'success') || 'default'
            }>
            {value?.name || ''}
          </Button>
        )}
      </DropdownTrigger>
      <DropdownMenu variant="solid" selectedKeys={[data.value]}>
        {values.map(value => (
          <DropdownItem
            key={value.key}
            color={
              ['danger', 'warning', 'success'].includes(value.color)
                ? (value.color as 'danger' | 'warning' | 'success')
                : 'default'
            }
            className={
              hovered === value.key && locations.find(l => l.name === value.key)
                ? getTextColorClasses(value.color)
                : ''
            }
            style={{
              backgroundColor: hovered === value.key ? value.color : '',
            }}
            onHoverChange={() => setHovered(value.key)}>
            {locations.find(l => l.name === value.key) ? (
              <Location locationName={value.key} className="h-6" />
            ) : (
              value.name
            )}
          </DropdownItem>
        ))}
      </DropdownMenu>
    </Dropdown>
  )
}
