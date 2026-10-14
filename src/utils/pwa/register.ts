export const swSupported = () =>
  typeof navigator !== 'undefined' && 'serviceWorker' in navigator

export const WARM_PAGES = ['/', '/schedule', '/salary']

export async function registerServiceWorker() {
  if (!swSupported()) return null

  const dev = process.env.NODE_ENV !== 'production'

  return navigator.serviceWorker.register(dev ? '/sw.js?dev' : '/sw.js', {
    scope: '/',
    updateViaCache: 'none',
  })
}

async function post(message: Record<string, unknown>) {
  if (!swSupported()) return

  const registration = await navigator.serviceWorker.ready

  registration.active?.postMessage(message)
}

export const setCacheUser = (id: number) => post({type: 'SET_USER', id})

export const warmPages = (urls: string[] = WARM_PAGES) =>
  post({type: 'WARM', urls})

export const clearCaches = () => post({type: 'CLEAR_USER_DATA'})

export interface CachedInfo {
  at: number | null
  stale: boolean
}

export async function cachedAt(path: string): Promise<CachedInfo | null> {
  if (!swSupported()) return null

  const registration = await navigator.serviceWorker.ready
  const worker = registration.active

  if (!worker) return null

  return new Promise(resolve => {
    const channel = new MessageChannel()
    const timer = setTimeout(() => resolve(null), 1500)

    channel.port1.onmessage = event => {
      clearTimeout(timer)
      resolve(event.data ?? null)
    }

    worker.postMessage({type: 'CACHED_AT', path}, [channel.port2])
  })
}
