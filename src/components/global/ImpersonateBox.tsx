'use client'

import {ComboBox, Input, ListBox} from '@heroui/react'
import {setCookie, getCookie} from 'cookies-next/client'

interface ImpersonateBoxProps {
  users: {name: string; id: number}[]
}

export default function ImpersonateBox({users}: ImpersonateBoxProps) {
  const impersonateId = getCookie('impersonate')?.valueOf()

  return (
    <ComboBox
      className="max-w-50"
      selectedKey={Number(impersonateId) || null}
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
          {users.map(({name, id}) => (
            <ListBox.Item key={id} id={id} textValue={name}>
              {name}
            </ListBox.Item>
          ))}
        </ListBox>
      </ComboBox.Popover>
    </ComboBox>
  )
}
