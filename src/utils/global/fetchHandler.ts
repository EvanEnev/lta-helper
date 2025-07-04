import {addToast} from '@heroui/react'

interface FetchHandlerProps {
  url: string
  method?: string
  body?: object
}

export default async function fetchHandler({
  url,
  method = 'GET',
  body = {},
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
    return json
  } else {
    addToast({
      color: 'danger',
      title: 'Ошибка!',
      description: json.message || 'Неизвестная ошибка',
    })

    return false
  }
}
