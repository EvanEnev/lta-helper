import {toast} from '@/components/ui/toast'
import {
  QUEUEABLE_URLS,
  getOutbox,
  getOutboxUser,
} from '@/src/utils/offline/outbox'

interface FetchHandlerProps {
  url: string
  method?: string
  body?: object
  showNotification?: boolean
  queue?: string
}

export interface QueuedResult {
  queued: true
}

export const isQueued = (value: unknown): value is QueuedResult =>
  typeof value === 'object' && value !== null && 'queued' in value

export default async function fetchHandler({
  url,
  method = 'GET',
  body = {},
  showNotification = true,
  queue,
}: FetchHandlerProps): Promise<any | false> {
  const options: {method: string; body?: string} = {method}

  if (body && Object.keys(body).length) {
    options.method = 'POST'
    options.body = JSON.stringify(body)
  }

  const canQueue = !!queue && !!options.body && QUEUEABLE_URLS.includes(url)

  const enqueue = async () => {
    const userId = getOutboxUser()

    if (userId === null) return false

    await getOutbox().enqueue({
      userId,
      url,
      body: options.body!,
      label: queue!,
    })

    toast.add({
      title: 'Нет сети',
      description: 'Действие сохранено и отправится, когда появится связь',
      type: 'info',
      timeout: 8000,
    })

    return {queued: true} as QueuedResult
  }

  if (canQueue && typeof navigator !== 'undefined' && !navigator.onLine) {
    const queued = await enqueue()

    if (queued) return queued
  }

  let response: Response

  try {
    response = await fetch(url, options)
  } catch {
    if (canQueue) {
      const queued = await enqueue()

      if (queued) return queued
    }

    toast.add({
      title: 'Нет сети',
      description: 'Проверьте подключение и повторите',
      type: 'error',
    })

    return false
  }

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
      type: 'error',
      description: json.message || 'Неизвестная ошибка',
    })

    return false
  }
}
