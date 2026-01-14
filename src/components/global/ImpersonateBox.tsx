'use client'

import {ComboBox, Input, ListBox} from '@heroui/react-beta'
import {setCookie, getCookie} from 'cookies-next/client'

interface ImpersonateBoxProps {
  users: {name: string; telegram_id: number}[]
}

export default function ImpersonateBox({users}: ImpersonateBoxProps) {
  const impersonateId = getCookie('impersonate')?.valueOf()

  return (
    <ComboBox
      className="max-w-50"
      selectedKey={impersonateId}
      onSelectionChange={async id => {
        setCookie('impersonate', String(id))
        sessionStorage.removeItem('worker')
        window.location.reload()
      }}>
      <ComboBox.InputGroup>
        <Input />
        <ComboBox.Trigger />
      </ComboBox.InputGroup>
      <ComboBox.Popover className="h-100">
        <ListBox>
          {users.map(({name, telegram_id}) => (
            <ListBox.Item key={telegram_id} id={telegram_id} textValue={name}>
              {name}
            </ListBox.Item>
          ))}
        </ListBox>
      </ComboBox.Popover>
    </ComboBox>
  )
}
