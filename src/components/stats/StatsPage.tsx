'use client'

import {Button, Form, Input} from '@heroui/react'

export default function StatsPage() {
  return (
    <main>
      <Form
        onSubmit={async e => {
          e.preventDefault()
          const file = (e.currentTarget.elements[0] as HTMLInputElement)
            .files?.[0]
          const formData = new FormData()
          formData.append('file', file)

          const data = await fetch('/api/stats/alphatag/retrieve', {
            method: 'POST',
            body: formData,
          })
        }}>
        <Input type="file" name="files" />
        <Button type="submit">Отправить</Button>
      </Form>
    </main>
  )
}
