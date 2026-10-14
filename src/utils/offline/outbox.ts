export interface OutboxItem {
  id: number
  userId: number
  url: string
  body: string
  label: string
  createdAt: number
  attempts: number
  status: 'pending' | 'failed'
  error?: string
}

export type NewOutboxItem = Pick<
  OutboxItem,
  'userId' | 'url' | 'body' | 'label'
>

export interface OutboxStorage {
  all(): Promise<OutboxItem[]>
  add(item: Omit<OutboxItem, 'id'>): Promise<number>
  put(item: OutboxItem): Promise<void>
  remove(id: number): Promise<void>
}

export interface OutboxSnapshot {
  items: OutboxItem[]
  pending: number
  failed: number
}

export interface FlushResult {
  sent: number
  failed: number
}

export const QUEUEABLE_URLS = [
  '/api/salary/send',
  '/api/send',
  '/api/profile/setLocation',
]

const MAX_ATTEMPTS = 8

const EMPTY: OutboxSnapshot = {items: [], pending: 0, failed: 0}

const snapshotOf = (items: OutboxItem[]): OutboxSnapshot => ({
  items,
  pending: items.filter(item => item.status === 'pending').length,
  failed: items.filter(item => item.status === 'failed').length,
})

export class Outbox {
  private snapshot = EMPTY
  private listeners = new Set<() => void>()
  private flushing = false

  constructor(
    private storage: OutboxStorage,
    private send: typeof fetch = (...args) => fetch(...args),
    private withLock: <T>(run: () => Promise<T>) => Promise<T | null> = run =>
      run(),
  ) {}

  subscribe = (listener: () => void) => {
    this.listeners.add(listener)

    return () => {
      this.listeners.delete(listener)
    }
  }

  getSnapshot = () => this.snapshot

  getServerSnapshot = () => EMPTY

  private publish(items: OutboxItem[]) {
    this.snapshot = snapshotOf(items.sort((a, b) => a.id - b.id))
    this.listeners.forEach(listener => listener())
  }

  async refresh() {
    this.publish(await this.storage.all())
  }

  async enqueue(input: NewOutboxItem) {
    await this.storage.add({
      ...input,
      createdAt: Date.now(),
      attempts: 0,
      status: 'pending',
    })
    await this.refresh()
  }

  async purgeOthers(userId: number) {
    const items = await this.storage.all()

    await Promise.all(
      items
        .filter(item => item.userId !== userId)
        .map(item => this.storage.remove(item.id)),
    )
    await this.refresh()
  }

  async discard(id: number) {
    await this.storage.remove(id)
    await this.refresh()
  }

  async retry(id: number) {
    const item = (await this.storage.all()).find(entry => entry.id === id)

    if (item) {
      await this.storage.put({
        ...item,
        status: 'pending',
        attempts: 0,
        error: undefined,
      })
    }

    await this.refresh()
  }

  async clear() {
    const items = await this.storage.all()

    await Promise.all(items.map(item => this.storage.remove(item.id)))
    await this.refresh()
  }

  async flush(userId: number): Promise<FlushResult> {
    const result: FlushResult = {sent: 0, failed: 0}

    if (this.flushing) return result

    this.flushing = true

    try {
      await this.withLock(async () => {
        const items = (await this.storage.all())
          .filter(item => item.userId === userId && item.status === 'pending')
          .sort((a, b) => a.id - b.id)

        for (const item of items) {
          let response: Response

          try {
            response = await this.send(item.url, {
              method: 'POST',
              headers: {'Content-Type': 'application/json'},
              body: item.body,
              credentials: 'same-origin',
            })
          } catch {
            break
          }

          if (response.ok) {
            await this.storage.remove(item.id)
            result.sent += 1
            continue
          }

          const message: string | undefined = await response
            .json()
            .then(json => json?.message)
            .catch(() => undefined)

          if (response.status === 401) break

          const retriable =
            response.status === 408 ||
            response.status === 429 ||
            response.status >= 500

          if (retriable && item.attempts + 1 < MAX_ATTEMPTS) {
            await this.storage.put({...item, attempts: item.attempts + 1})
            break
          }

          await this.storage.put({
            ...item,
            attempts: item.attempts + 1,
            status: 'failed',
            error: message || `Ошибка ${response.status}`,
          })
          result.failed += 1
        }
      })
    } finally {
      this.flushing = false
      await this.refresh()
    }

    return result
  }
}

export function memoryStorage(): OutboxStorage {
  let next = 1
  const rows = new Map<number, OutboxItem>()

  return {
    all: async () => [...rows.values()],
    add: async item => {
      const id = next++
      rows.set(id, {...item, id})

      return id
    },
    put: async item => {
      rows.set(item.id, item)
    },
    remove: async id => {
      rows.delete(id)
    },
  }
}

const DB_NAME = 'lta-outbox'
const STORE = 'queue'

function openDb() {
  return new Promise<IDBDatabase>((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1)

    request.onupgradeneeded = () => {
      request.result.createObjectStore(STORE, {
        keyPath: 'id',
        autoIncrement: true,
      })
    }
    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error)
  })
}

async function run<T>(
  mode: IDBTransactionMode,
  action: (store: IDBObjectStore) => IDBRequest<T>,
) {
  const db = await openDb()

  return new Promise<T>((resolve, reject) => {
    const request = action(db.transaction(STORE, mode).objectStore(STORE))

    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error)
  }).finally(() => db.close())
}

export function indexedDbStorage(): OutboxStorage {
  return {
    all: () =>
      run('readonly', store => store.getAll() as IDBRequest<OutboxItem[]>),
    add: async item => Number(await run('readwrite', store => store.add(item))),
    put: async item => {
      await run('readwrite', store => store.put(item))
    },
    remove: async id => {
      await run('readwrite', store => store.delete(id))
    },
  }
}

const lock = async <T>(job: () => Promise<T>): Promise<T | null> => {
  if (typeof navigator === 'undefined' || !navigator.locks) return job()

  return navigator.locks.request(
    'lta-outbox-flush',
    {ifAvailable: true},
    async held => (held ? job() : null),
  )
}

let outboxUser: number | null = null

export const setOutboxUser = (id: number | null) => {
  outboxUser = id
}

export const getOutboxUser = () => outboxUser

let instance: Outbox | null = null

export function getOutbox() {
  if (!instance) {
    instance = new Outbox(
      typeof indexedDB === 'undefined' ? memoryStorage() : indexedDbStorage(),
      undefined,
      lock,
    )
  }

  return instance
}
