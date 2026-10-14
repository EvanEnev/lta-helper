import {useSyncExternalStore} from 'react'
import {getOutbox} from '@/src/utils/offline/outbox'

export default function useOutbox() {
  const outbox = getOutbox()

  return useSyncExternalStore(
    outbox.subscribe,
    outbox.getSnapshot,
    outbox.getServerSnapshot,
  )
}
