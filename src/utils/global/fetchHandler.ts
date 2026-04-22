import {toast} from '@heroui/react'

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

  console.debug(options)
  const response = await fetch(url, options)

  let json: any = {}

  try {
    json = await response.json()
  } catch {}

  if (response.ok) {
    toast('Успешно!', {variant: 'success'})
    return json
  } else {
    toast('Ошибка!', {
      variant: 'danger',
      description: json.message || 'Неизвестная ошибка',
    })

    return false
  }
}
