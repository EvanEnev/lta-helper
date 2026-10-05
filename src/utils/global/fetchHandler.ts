import {toast} from '@/components/ui/toast'

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
      toast.add({
        title: 'Предупреждение!',
        timeout: 10000,
        description: json.warning,
        type: 'warning',
      })
    } else if (showNotification) {
      toast.add({title: 'Успешно!', type: 'success'})
    }

    return json
  } else {
    toast.add({
      title: 'Ошибка!',
      type: 'danger',
      description: json.message || 'Неизвестная ошибка',
    })

    return false
  }
}
