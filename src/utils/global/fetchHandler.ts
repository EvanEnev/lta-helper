import {toast} from '@heroui/react'

interface FetchHandlerProps {
  url: string
  method?: string
  body?: object
  showNotification?: boolean
}

export default async function fetchHandler({
  url,
  method = 'GET',
  body = {},
  showNotification = true,
}: FetchHandlerProps): Promise<any | false> {
  const options: {method: string; body?: string} = {method}

  if (body && Object.keys(body).length) {
    options.method = 'POST'
    options.body = JSON.stringify(body)
  }

  const response = await fetch(url, options)

  let json: any = {}

  try {
    json = await response.json()
  } catch {}

  if (response.ok) {
    if (json.warning && showNotification) {
      toast('Предупреждение!', {
        timeout: 10000,
        description: json.warning,
        variant: 'warning',
      })
    } else if (showNotification) {
      toast('Успешно!', {variant: 'success'})
    }

    return json
  } else {
    toast('Ошибка!', {
      variant: 'danger',
      description: json.message || 'Неизвестная ошибка',
    })

    return false
  }
}
