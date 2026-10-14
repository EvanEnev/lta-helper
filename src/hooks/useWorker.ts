import {useEffect, useSyncExternalStore} from 'react'
import {useSession} from '@/lib/auth/authClient'
import type {LTWorker} from '@/src/utils/types'

const KEY = 'lta-worker'

type StoredWorker = Pick<
  LTWorker,
  'id' | 'name' | 'rank' | 'locationId' | 'location' | 'permissions'
>

const listeners = new Set<() => void>()

const notify = () => listeners.forEach(listener => listener())

let rawCache: string | null | undefined
let parsedCache: StoredWorker | undefined

const read = () => {
  let raw: string | null = null

  try {
    raw = localStorage.getItem(KEY)
  } catch {}

  if (raw !== rawCache) {
    rawCache = raw
    parsedCache = raw ? (JSON.parse(raw) as StoredWorker) : undefined
  }

  return parsedCache
}

const subscribe = (listener: () => void) => {
  listeners.add(listener)
  window.addEventListener('storage', listener)

  return () => {
    listeners.delete(listener)
    window.removeEventListener('storage', listener)
  }
}

export function forgetWorker() {
  try {
    localStorage.removeItem(KEY)
  } catch {}
  notify()
}

export default function useWorker() {
  const {data, isPending, error} = useSession()
  const live = data?.user as LTWorker | undefined
  const stored = useSyncExternalStore(subscribe, read, () => undefined)

  useEffect(() => {
    if (live?.id) {
      const slim: StoredWorker = {
        id: live.id,
        name: live.name,
        rank: live.rank,
        locationId: live.locationId,
        location: live.location,
        permissions: (live.permissions ?? []).map(({name}) => ({
          name,
        })) as StoredWorker['permissions'],
      }
      const raw = JSON.stringify(slim)

      try {
        if (localStorage.getItem(KEY) !== raw) {
          localStorage.setItem(KEY, raw)
          notify()
        }
      } catch {}
    } else if (!isPending && !error && !data) {
      forgetWorker()
    }
  }, [live, isPending, error, data])

  return live ?? (stored as LTWorker | undefined)
}
