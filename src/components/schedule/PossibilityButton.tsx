import {ChevronDownIcon} from '@/public/icons/ChevronDownIcon'
import {
  ButtonGroup,
  Button,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
} from '@heroui/react'
import {useState} from 'react'
import LocationIcon from '@/src/components/global/LocationIcon'
import {Icon} from '@iconify/react'

type Props = {
  isAdmin: boolean
  location?: string
  value?: string
  isDisabled?: boolean
  handler: (value: string) => void
  selectedValue?: string
}

export default function PossibilityButton({
  isAdmin,
  location,
  isDisabled,
  handler,
  selectedValue,
}: Props) {
  const [selectedOption, setSelectedOption] = useState<string>('Могу')

  return (
    <ButtonGroup>
      <Button
        isDisabled={isDisabled}
        className="h-14 w-full"
        size="lg"
        slot="icon"
        variant={
          selectedValue === (selectedOption === 'Могу' ? '+' : location)
            ? 'primary'
            : 'tertiary'
        }
        onPress={() => {
          handler(selectedOption === 'Могу' ? '+' : selectedOption)
        }}>
        {selectedOption === 'Могу' || !selectedOption ? (
          <Icon icon="solar:add-circle-linear" width="24" height="24" />
        ) : (
          <LocationIcon locationName={location || ''} />
        )}
        {selectedOption}
      </Button>
      {isAdmin && (
        <Dropdown>
          <Button
            slot="icon"
            variant="tertiary"
            className="h-14 w-14"
            isIconOnly>
            <ButtonGroup.Separator />
            <Icon icon="solar:alt-arrow-down-linear" width="24" height="24" />
          </Button>
          <Dropdown.Popover>
            <Dropdown.Menu
              disallowEmptySelection
              aria-label="Location Options"
              selectedKeys={selectedOption}
              selectionMode="single"
              onSelectionChange={selected =>
                setSelectedOption(Array.from(selected)[0].toString())
              }
              className="max-w-75">
              <Dropdown.Item isDisabled={isDisabled} id="Могу" key="Могу">
                Могу
              </Dropdown.Item>
              <Dropdown.Item
                id={location || ''}
                isDisabled={isDisabled}
                key={location || ''}>
                {location}
              </Dropdown.Item>
            </Dropdown.Menu>
          </Dropdown.Popover>
        </Dropdown>
      )}
    </ButtonGroup>
  )
}
