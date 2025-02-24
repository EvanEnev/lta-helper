import {ChevronDownIcon} from '@/public/icons/ChevronDownIcon'
import {
  ButtonGroup,
  Button,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
} from "@heroui/react"
import {useState} from 'react'
import {AddCircle} from 'solar-icon-set'

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
  const [selectedOption, setSelecteOption] = useState<string>('Могу')

  return (
    <ButtonGroup>
      <Button
        startContent={<AddCircle size={24} />}
        isDisabled={isDisabled}
        className="h-14 w-full"
        size="lg"
        color={
          selectedValue === (selectedOption === 'Могу' ? '+' : location)
            ? 'success'
            : 'default'
        }
        onPress={() => {
          handler(selectedOption === 'Могу' ? '+' : selectedOption)
        }}>
        {selectedOption}
      </Button>
      {isAdmin && (
        <Dropdown placement="bottom-end" isDisabled={isDisabled}>
          <DropdownTrigger className="h-14">
            <Button isIconOnly>
              <ChevronDownIcon />
            </Button>
          </DropdownTrigger>
          <DropdownMenu
            disallowEmptySelection
            aria-label="Location Options"
            selectedKeys={selectedOption}
            selectionMode="single"
            onSelectionChange={selected =>
              setSelecteOption(Array.from(selected)[0].toString())
            }
            className="max-w-[300px]">
            <DropdownItem key="Могу">Могу</DropdownItem>
            <DropdownItem key={location || ''}>{location}</DropdownItem>
          </DropdownMenu>
        </Dropdown>
      )}
    </ButtonGroup>
  )
}
